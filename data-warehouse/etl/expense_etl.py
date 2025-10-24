#!/usr/bin/env python3
"""
Expense ETL Pipeline
This script extracts expense data from the operational database,
transforms it for analytics, and loads it into the data warehouse.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging
import json
import yaml

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import psycopg2
from psycopg2.extras import RealDictCursor

import boto3
from botocore.exceptions import ClientError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ExpenseETL:
    def __init__(self, config_path: str = "config/etl_config.yaml"):
        """Initialize the ETL pipeline with configuration"""
        self.config = self.load_config(config_path)
        self.setup_connections()
        
        # ETL state tracking
        self.last_run_time = None
        self.processed_records = 0
        self.failed_records = 0
        
    def load_config(self, config_path: str) -> Dict:
        """Load ETL configuration from YAML file"""
        try:
            with open(config_path, 'r') as file:
                config = yaml.safe_load(file)
            logger.info(f"Configuration loaded from {config_path}")
            return config
        except Exception as e:
            logger.error(f"Failed to load configuration: {e}")
            raise
    
    def setup_connections(self):
        """Setup database and S3 connections"""
        try:
            # Source database connection
            self.source_engine = create_engine(
                self.config['source_database']['connection_string'],
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True
            )
            
            # Data warehouse connection
            self.dw_engine = create_engine(
                self.config['data_warehouse']['connection_string'],
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True
            )
            
            # S3 client for data lake
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.config['s3']['access_key_id'],
                aws_secret_access_key=self.config['s3']['secret_access_key'],
                region_name=self.config['s3']['region']
            )
            
            logger.info("Database and S3 connections established")
            
        except Exception as e:
            logger.error(f"Failed to setup connections: {e}")
            raise
    
    def extract_expenses(self, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """Extract expense data from source database"""
        logger.info(f"Extracting expenses from {start_date} to {end_date}")
        
        query = """
        SELECT 
            e.id,
            e.organization_id,
            e.user_id,
            e.description,
            e.amount,
            e.currency,
            e.category,
            e.subcategory,
            e.vendor,
            e.date,
            e.created_at,
            e.updated_at,
            e.status,
            e.billable,
            e.receipt_url,
            e.tags,
            e.notes,
            u.first_name,
            u.last_name,
            u.email,
            o.name as organization_name,
            o.industry,
            o.size
        FROM expenses e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN organizations o ON e.organization_id = o.id
        WHERE e.date BETWEEN :start_date AND :end_date
        AND e.deleted_at IS NULL
        ORDER BY e.date DESC
        """
        
        try:
            with self.source_engine.connect() as conn:
                df = pd.read_sql(
                    text(query),
                    conn,
                    params={'start_date': start_date, 'end_date': end_date}
                )
            
            logger.info(f"Extracted {len(df)} expense records")
            return df
            
        except Exception as e:
            logger.error(f"Failed to extract expenses: {e}")
            raise
    
    def extract_organizations(self) -> pd.DataFrame:
        """Extract organization data for dimension table"""
        logger.info("Extracting organization data")
        
        query = """
        SELECT 
            id,
            name,
            industry,
            size,
            created_at,
            updated_at,
            status,
            subscription_plan,
            country,
            timezone
        FROM organizations
        WHERE deleted_at IS NULL
        """
        
        try:
            with self.source_engine.connect() as conn:
                df = pd.read_sql(text(query), conn)
            
            logger.info(f"Extracted {len(df)} organization records")
            return df
            
        except Exception as e:
            logger.error(f"Failed to extract organizations: {e}")
            raise
    
    def extract_users(self) -> pd.DataFrame:
        """Extract user data for dimension table"""
        logger.info("Extracting user data")
        
        query = """
        SELECT 
            id,
            organization_id,
            first_name,
            last_name,
            email,
            role,
            created_at,
            updated_at,
            last_login_at,
            status
        FROM users
        WHERE deleted_at IS NULL
        """
        
        try:
            with self.source_engine.connect() as conn:
                df = pd.read_sql(text(query), conn)
            
            logger.info(f"Extracted {len(df)} user records")
            return df
            
        except Exception as e:
            logger.error(f"Failed to extract users: {e}")
            raise
    
    def transform_expenses(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform expense data for analytics"""
        logger.info("Transforming expense data")
        
        # Create a copy to avoid modifying original
        df_transformed = df.copy()
        
        # Data type conversions
        df_transformed['date'] = pd.to_datetime(df_transformed['date'])
        df_transformed['created_at'] = pd.to_datetime(df_transformed['created_at'])
        df_transformed['updated_at'] = pd.to_datetime(df_transformed['updated_at'])
        df_transformed['amount'] = pd.to_numeric(df_transformed['amount'], errors='coerce')
        
        # Create derived fields
        df_transformed['year'] = df_transformed['date'].dt.year
        df_transformed['month'] = df_transformed['date'].dt.month
        df_transformed['quarter'] = df_transformed['date'].dt.quarter
        df_transformed['day_of_week'] = df_transformed['date'].dt.dayofweek
        df_transformed['is_weekend'] = df_transformed['day_of_week'].isin([5, 6]).astype(int)
        df_transformed['is_month_end'] = df_transformed['date'].dt.is_month_end.astype(int)
        df_transformed['is_quarter_end'] = df_transformed['date'].dt.is_quarter_end.astype(int)
        df_transformed['is_year_end'] = df_transformed['date'].dt.is_year_end.astype(int)
        
        # Amount-based categorizations
        df_transformed['amount_bucket'] = pd.cut(
            df_transformed['amount'],
            bins=[0, 10, 50, 100, 500, 1000, float('inf')],
            labels=['0-10', '10-50', '50-100', '100-500', '500-1000', '1000+']
        )
        
        # Text analysis
        df_transformed['description_length'] = df_transformed['description'].str.len()
        df_transformed['word_count'] = df_transformed['description'].str.split().str.len()
        df_transformed['has_receipt'] = df_transformed['receipt_url'].notna().astype(int)
        
        # Vendor analysis
        df_transformed['vendor_clean'] = df_transformed['vendor'].str.lower().str.strip()
        df_transformed['vendor_length'] = df_transformed['vendor'].str.len()
        
        # Category standardization
        df_transformed['category_standardized'] = df_transformed['category'].str.lower().str.strip()
        
        # Create expense type based on amount and category
        def categorize_expense_type(row):
            if row['amount'] < 50:
                return 'Small Expense'
            elif row['amount'] < 200:
                return 'Medium Expense'
            else:
                return 'Large Expense'
        
        df_transformed['expense_type'] = df_transformed.apply(categorize_expense_type, axis=1)
        
        # Create seasonality indicators
        df_transformed['season'] = df_transformed['month'].map({
            12: 'Winter', 1: 'Winter', 2: 'Winter',
            3: 'Spring', 4: 'Spring', 5: 'Spring',
            6: 'Summer', 7: 'Summer', 8: 'Summer',
            9: 'Fall', 10: 'Fall', 11: 'Fall'
        })
        
        # Handle missing values
        df_transformed['category'] = df_transformed['category'].fillna('Uncategorized')
        df_transformed['vendor'] = df_transformed['vendor'].fillna('Unknown')
        df_transformed['description'] = df_transformed['description'].fillna('No description')
        
        # Create composite keys
        df_transformed['expense_key'] = (
            df_transformed['organization_id'].astype(str) + '_' +
            df_transformed['id'].astype(str)
        )
        
        logger.info(f"Transformed {len(df_transformed)} expense records")
        return df_transformed
    
    def transform_organizations(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform organization data for dimension table"""
        logger.info("Transforming organization data")
        
        df_transformed = df.copy()
        
        # Data type conversions
        df_transformed['created_at'] = pd.to_datetime(df_transformed['created_at'])
        df_transformed['updated_at'] = pd.to_datetime(df_transformed['updated_at'])
        
        # Create derived fields
        df_transformed['organization_age_days'] = (
            datetime.now() - df_transformed['created_at']
        ).dt.days
        
        # Industry categorization
        industry_mapping = {
            'Technology': 'Tech',
            'Healthcare': 'Healthcare',
            'Finance': 'Finance',
            'Retail': 'Retail',
            'Manufacturing': 'Manufacturing',
            'Education': 'Education',
            'Other': 'Other'
        }
        df_transformed['industry_category'] = df_transformed['industry'].map(
            industry_mapping
        ).fillna('Other')
        
        # Size categorization
        size_mapping = {
            '1-10': 'Small',
            '11-50': 'Small',
            '51-200': 'Medium',
            '201-500': 'Medium',
            '501-1000': 'Large',
            '1000+': 'Large'
        }
        df_transformed['size_category'] = df_transformed['size'].map(
            size_mapping
        ).fillna('Unknown')
        
        logger.info(f"Transformed {len(df_transformed)} organization records")
        return df_transformed
    
    def transform_users(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform user data for dimension table"""
        logger.info("Transforming user data")
        
        df_transformed = df.copy()
        
        # Data type conversions
        df_transformed['created_at'] = pd.to_datetime(df_transformed['created_at'])
        df_transformed['updated_at'] = pd.to_datetime(df_transformed['updated_at'])
        df_transformed['last_login_at'] = pd.to_datetime(df_transformed['last_login_at'])
        
        # Create derived fields
        df_transformed['user_age_days'] = (
            datetime.now() - df_transformed['created_at']
        ).dt.days
        
        df_transformed['days_since_last_login'] = (
            datetime.now() - df_transformed['last_login_at']
        ).dt.days
        
        # User activity level
        def categorize_activity_level(row):
            if pd.isna(row['last_login_at']):
                return 'Inactive'
            elif row['days_since_last_login'] <= 7:
                return 'Very Active'
            elif row['days_since_last_login'] <= 30:
                return 'Active'
            elif row['days_since_last_login'] <= 90:
                return 'Moderately Active'
            else:
                return 'Inactive'
        
        df_transformed['activity_level'] = df_transformed.apply(
            categorize_activity_level, axis=1
        )
        
        # Role categorization
        role_mapping = {
            'admin': 'Administrator',
            'manager': 'Manager',
            'user': 'User',
            'viewer': 'Viewer'
        }
        df_transformed['role_category'] = df_transformed['role'].map(
            role_mapping
        ).fillna('User')
        
        logger.info(f"Transformed {len(df_transformed)} user records")
        return df_transformed
    
    def load_to_data_warehouse(self, df: pd.DataFrame, table_name: str):
        """Load transformed data to data warehouse"""
        logger.info(f"Loading {len(df)} records to {table_name}")
        
        try:
            # Use pandas to_sql with if_exists='replace' for full refresh
            # or if_exists='append' for incremental loads
            df.to_sql(
                table_name,
                self.dw_engine,
                if_exists='replace',  # Change to 'append' for incremental
                index=False,
                method='multi',
                chunksize=1000
            )
            
            logger.info(f"Successfully loaded {len(df)} records to {table_name}")
            
        except Exception as e:
            logger.error(f"Failed to load data to {table_name}: {e}")
            raise
    
    def load_to_data_lake(self, df: pd.DataFrame, s3_key: str):
        """Load raw data to S3 data lake"""
        logger.info(f"Loading {len(df)} records to S3: {s3_key}")
        
        try:
            # Convert DataFrame to Parquet for efficient storage
            parquet_buffer = df.to_parquet(index=False)
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.config['s3']['bucket'],
                Key=s3_key,
                Body=parquet_buffer,
                ContentType='application/octet-stream'
            )
            
            logger.info(f"Successfully loaded data to S3: {s3_key}")
            
        except Exception as e:
            logger.error(f"Failed to load data to S3: {e}")
            raise
    
    def create_aggregated_tables(self):
        """Create aggregated tables for faster analytics"""
        logger.info("Creating aggregated tables")
        
        # Monthly expense summary
        monthly_summary_query = """
        CREATE OR REPLACE TABLE monthly_expense_summary AS
        SELECT 
            organization_id,
            year,
            month,
            category,
            COUNT(*) as expense_count,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            MIN(amount) as min_amount,
            MAX(amount) as max_amount,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT vendor) as unique_vendors
        FROM fact_expenses
        GROUP BY organization_id, year, month, category
        """
        
        # Category performance
        category_performance_query = """
        CREATE OR REPLACE TABLE category_performance AS
        SELECT 
            organization_id,
            category,
            COUNT(*) as total_expenses,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT vendor) as unique_vendors,
            COUNT(CASE WHEN is_weekend = 1 THEN 1 END) as weekend_expenses,
            COUNT(CASE WHEN has_receipt = 1 THEN 1 END) as expenses_with_receipt
        FROM fact_expenses
        GROUP BY organization_id, category
        """
        
        # User spending patterns
        user_spending_query = """
        CREATE OR REPLACE TABLE user_spending_patterns AS
        SELECT 
            user_id,
            organization_id,
            COUNT(*) as total_expenses,
            SUM(amount) as total_amount,
            AVG(amount) as avg_amount,
            COUNT(DISTINCT category) as categories_used,
            COUNT(DISTINCT vendor) as vendors_used,
            MIN(date) as first_expense_date,
            MAX(date) as last_expense_date,
            COUNT(CASE WHEN is_weekend = 1 THEN 1 END) as weekend_expenses
        FROM fact_expenses
        GROUP BY user_id, organization_id
        """
        
        try:
            with self.dw_engine.connect() as conn:
                conn.execute(text(monthly_summary_query))
                conn.execute(text(category_performance_query))
                conn.execute(text(user_spending_query))
                conn.commit()
            
            logger.info("Successfully created aggregated tables")
            
        except Exception as e:
            logger.error(f"Failed to create aggregated tables: {e}")
            raise
    
    def run_etl(self, start_date: datetime, end_date: datetime):
        """Run the complete ETL pipeline"""
        logger.info(f"Starting ETL pipeline from {start_date} to {end_date}")
        
        try:
            # Extract data
            expenses_df = self.extract_expenses(start_date, end_date)
            organizations_df = self.extract_organizations()
            users_df = self.extract_users()
            
            # Transform data
            expenses_transformed = self.transform_expenses(expenses_df)
            organizations_transformed = self.transform_organizations(organizations_df)
            users_transformed = self.transform_users(users_df)
            
            # Load to data warehouse
            self.load_to_data_warehouse(expenses_transformed, 'fact_expenses')
            self.load_to_data_warehouse(organizations_transformed, 'dim_organizations')
            self.load_to_data_warehouse(users_transformed, 'dim_users')
            
            # Load to data lake
            s3_key = f"expenses/raw/{start_date.strftime('%Y/%m/%d')}/expenses_{start_date.strftime('%Y%m%d')}.parquet"
            self.load_to_data_lake(expenses_df, s3_key)
            
            # Create aggregated tables
            self.create_aggregated_tables()
            
            # Update ETL state
            self.last_run_time = datetime.now()
            self.processed_records = len(expenses_df)
            
            logger.info(f"ETL pipeline completed successfully. Processed {self.processed_records} records")
            
        except Exception as e:
            logger.error(f"ETL pipeline failed: {e}")
            raise
    
    def run_incremental_etl(self):
        """Run incremental ETL for recent data"""
        logger.info("Running incremental ETL")
        
        # Get last run time from state file
        state_file = Path("etl_state.json")
        if state_file.exists():
            with open(state_file, 'r') as f:
                state = json.load(f)
                last_run = datetime.fromisoformat(state['last_run_time'])
        else:
            # First run - process last 7 days
            last_run = datetime.now() - timedelta(days=7)
        
        # Run ETL for data since last run
        end_date = datetime.now()
        self.run_etl(last_run, end_date)
        
        # Update state
        state = {
            'last_run_time': end_date.isoformat(),
            'processed_records': self.processed_records
        }
        with open(state_file, 'w') as f:
            json.dump(state, f, indent=2)

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Run expense ETL pipeline')
    parser.add_argument('--start-date', required=True, help='Start date (YYYY-MM-DD)')
    parser.add_argument('--end-date', required=True, help='End date (YYYY-MM-DD)')
    parser.add_argument('--incremental', action='store_true', help='Run incremental ETL')
    parser.add_argument('--config', default='config/etl_config.yaml', help='ETL configuration file')
    
    args = parser.parse_args()
    
    # Initialize ETL pipeline
    etl = ExpenseETL(args.config)
    
    if args.incremental:
        # Run incremental ETL
        etl.run_incremental_etl()
    else:
        # Run full ETL
        start_date = datetime.strptime(args.start_date, '%Y-%m-%d')
        end_date = datetime.strptime(args.end_date, '%Y-%m-%d')
        etl.run_etl(start_date, end_date)

if __name__ == "__main__":
    main()






