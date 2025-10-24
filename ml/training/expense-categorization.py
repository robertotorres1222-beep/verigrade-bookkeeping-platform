#!/usr/bin/env python3
"""
Expense Categorization ML Model Training
This script trains a machine learning model to automatically categorize expenses
based on description, amount, and other features.
"""

import pandas as pd
import numpy as np
import pickle
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import FunctionTransformer

import xgboost as xgb
import lightgbm as lgb
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.pipeline import Pipeline as ImbPipeline

import mlflow
import mlflow.sklearn
import mlflow.xgboost
import mlflow.lightgbm

# Configure MLflow
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("expense-categorization")

class ExpenseCategorizationTrainer:
    def __init__(self, data_path: str, model_path: str = "models/"):
        self.data_path = data_path
        self.model_path = Path(model_path)
        self.model_path.mkdir(exist_ok=True)
        
        # Initialize components
        self.text_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2
        )
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        
        # Model configurations
        self.models = {
            'random_forest': RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            ),
            'logistic_regression': LogisticRegression(
                max_iter=1000,
                random_state=42,
                n_jobs=-1
            ),
            'xgboost': xgb.XGBClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42,
                n_jobs=-1
            ),
            'lightgbm': lgb.LGBMClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42,
                n_jobs=-1,
                verbose=-1
            )
        }
        
        self.best_model = None
        self.best_score = 0
        self.feature_names = []
        
    def load_data(self) -> pd.DataFrame:
        """Load and preprocess expense data"""
        print("Loading expense data...")
        
        # Load data from CSV or database
        if self.data_path.endswith('.csv'):
            df = pd.read_csv(self.data_path)
        else:
            # Load from database (implement based on your database)
            df = self.load_from_database()
        
        print(f"Loaded {len(df)} expense records")
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocess the data for training"""
        print("Preprocessing data...")
        
        # Clean and prepare features
        df = df.dropna(subset=['description', 'category'])
        
        # Text preprocessing
        df['description_clean'] = df['description'].str.lower().str.strip()
        
        # Feature engineering
        df['amount_log'] = np.log1p(df['amount'])
        df['amount_binned'] = pd.cut(df['amount'], bins=10, labels=False)
        df['description_length'] = df['description'].str.len()
        df['word_count'] = df['description'].str.split().str.len()
        
        # Date features
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df['month'] = df['date'].dt.month
            df['day_of_week'] = df['date'].dt.dayofweek
            df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Vendor features
        if 'vendor' in df.columns:
            df['vendor_clean'] = df['vendor'].str.lower().str.strip()
            df['vendor_length'] = df['vendor'].str.len()
        
        # Prepare features and target
        text_features = df['description_clean'].fillna('')
        numeric_features = df[['amount_log', 'amount_binned', 'description_length', 'word_count']].fillna(0)
        
        if 'month' in df.columns:
            numeric_features = pd.concat([numeric_features, df[['month', 'day_of_week', 'is_weekend']]], axis=1)
        
        if 'vendor_length' in df.columns:
            numeric_features = pd.concat([numeric_features, df[['vendor_length']]], axis=1)
        
        # Vectorize text features
        X_text = self.text_vectorizer.fit_transform(text_features)
        X_numeric = numeric_features.values
        
        # Combine features
        X = np.hstack([X_text.toarray(), X_numeric])
        
        # Encode target variable
        y = self.label_encoder.fit_transform(df['category'])
        
        # Store feature names for later use
        self.feature_names = (
            list(self.text_vectorizer.get_feature_names_out()) + 
            list(numeric_features.columns)
        )
        
        print(f"Feature matrix shape: {X.shape}")
        print(f"Number of categories: {len(self.label_encoder.classes_)}")
        
        return X, y
    
    def train_models(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """Train multiple models and select the best one"""
        print("Training models...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Handle class imbalance
        smote = SMOTE(random_state=42)
        X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train_balanced)
        X_test_scaled = self.scaler.transform(X_test)
        
        results = {}
        
        with mlflow.start_run():
            for name, model in self.models.items():
                print(f"Training {name}...")
                
                # Train model
                model.fit(X_train_scaled, y_train_balanced)
                
                # Predict and evaluate
                y_pred = model.predict(X_test_scaled)
                accuracy = accuracy_score(y_test, y_pred)
                
                # Cross-validation score
                cv_scores = cross_val_score(model, X_train_scaled, y_train_balanced, cv=5)
                cv_mean = cv_scores.mean()
                cv_std = cv_scores.std()
                
                results[name] = {
                    'accuracy': accuracy,
                    'cv_mean': cv_mean,
                    'cv_std': cv_std
                }
                
                # Log metrics to MLflow
                mlflow.log_metric(f"{name}_accuracy", accuracy)
                mlflow.log_metric(f"{name}_cv_mean", cv_mean)
                mlflow.log_metric(f"{name}_cv_std", cv_std)
                
                # Log model
                if name == 'xgboost':
                    mlflow.xgboost.log_model(model, f"{name}_model")
                elif name == 'lightgbm':
                    mlflow.lightgbm.log_model(model, f"{name}_model")
                else:
                    mlflow.sklearn.log_model(model, f"{name}_model")
                
                print(f"{name} - Accuracy: {accuracy:.4f}, CV: {cv_mean:.4f} (+/- {cv_std:.4f})")
                
                # Select best model
                if accuracy > self.best_score:
                    self.best_score = accuracy
                    self.best_model = model
            
            # Log best model
            mlflow.log_metric("best_accuracy", self.best_score)
            mlflow.log_param("best_model", self.best_model.__class__.__name__)
            
            # Log classification report
            y_pred_best = self.best_model.predict(X_test_scaled)
            report = classification_report(y_test, y_pred_best, output_dict=True)
            mlflow.log_text(json.dumps(report, indent=2), "classification_report.json")
        
        return results
    
    def hyperparameter_tuning(self, X: np.ndarray, y: np.ndarray) -> Dict[str, any]:
        """Perform hyperparameter tuning for the best model"""
        print("Performing hyperparameter tuning...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Handle class imbalance
        smote = SMOTE(random_state=42)
        X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train_balanced)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define parameter grids for different models
        param_grids = {
            'random_forest': {
                'n_estimators': [50, 100, 200],
                'max_depth': [5, 10, 15, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            },
            'xgboost': {
                'n_estimators': [50, 100, 200],
                'learning_rate': [0.01, 0.1, 0.2],
                'max_depth': [3, 6, 9],
                'subsample': [0.8, 0.9, 1.0]
            },
            'lightgbm': {
                'n_estimators': [50, 100, 200],
                'learning_rate': [0.01, 0.1, 0.2],
                'max_depth': [3, 6, 9],
                'subsample': [0.8, 0.9, 1.0]
            }
        }
        
        best_params = {}
        
        for model_name, param_grid in param_grids.items():
            if model_name in self.models:
                print(f"Tuning hyperparameters for {model_name}...")
                
                model = self.models[model_name]
                grid_search = GridSearchCV(
                    model, param_grid, cv=3, scoring='accuracy', n_jobs=-1
                )
                grid_search.fit(X_train_scaled, y_train_balanced)
                
                best_params[model_name] = grid_search.best_params_
                print(f"{model_name} best params: {grid_search.best_params_}")
                print(f"{model_name} best score: {grid_search.best_score_:.4f}")
        
        return best_params
    
    def save_model(self, model_name: str = "expense_categorization_model"):
        """Save the trained model and preprocessing components"""
        print("Saving model...")
        
        # Save model
        model_file = self.model_path / f"{model_name}.pkl"
        with open(model_file, 'wb') as f:
            pickle.dump(self.best_model, f)
        
        # Save preprocessing components
        preprocessor_file = self.model_path / f"{model_name}_preprocessor.pkl"
        with open(preprocessor_file, 'wb') as f:
            pickle.dump({
                'text_vectorizer': self.text_vectorizer,
                'label_encoder': self.label_encoder,
                'scaler': self.scaler,
                'feature_names': self.feature_names
            }, f)
        
        # Save model metadata
        metadata = {
            'model_name': model_name,
            'model_type': self.best_model.__class__.__name__,
            'accuracy': self.best_score,
            'feature_count': len(self.feature_names),
            'category_count': len(self.label_encoder.classes_),
            'categories': self.label_encoder.classes_.tolist(),
            'training_date': datetime.now().isoformat(),
            'version': '1.0.0'
        }
        
        metadata_file = self.model_path / f"{model_name}_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Model saved to {model_file}")
        print(f"Preprocessor saved to {preprocessor_file}")
        print(f"Metadata saved to {metadata_file}")
    
    def load_from_database(self) -> pd.DataFrame:
        """Load data from database (implement based on your database)"""
        # This is a placeholder - implement based on your database
        # For example, using SQLAlchemy:
        """
        from sqlalchemy import create_engine
        import pandas as pd
        
        engine = create_engine('postgresql://user:password@localhost/dbname')
        query = '''
        SELECT description, amount, category, date, vendor
        FROM expenses
        WHERE category IS NOT NULL
        AND description IS NOT NULL
        '''
        return pd.read_sql(query, engine)
        """
        
        # For now, return sample data
        return pd.DataFrame({
            'description': [
                'Office supplies from Staples',
                'Lunch at McDonald\'s',
                'Gas station fill-up',
                'Software subscription',
                'Client dinner',
                'Uber ride to airport',
                'Coffee shop meeting',
                'Hotel accommodation',
                'Flight ticket',
                'Parking fee'
            ],
            'amount': [25.50, 12.75, 45.00, 99.99, 85.00, 15.50, 8.25, 120.00, 350.00, 5.00],
            'category': [
                'Office Supplies',
                'Meals',
                'Transportation',
                'Software',
                'Meals',
                'Transportation',
                'Meals',
                'Travel',
                'Travel',
                'Transportation'
            ],
            'date': pd.date_range('2024-01-01', periods=10, freq='D'),
            'vendor': [
                'Staples',
                'McDonald\'s',
                'Shell',
                'Adobe',
                'Restaurant',
                'Uber',
                'Starbucks',
                'Hilton',
                'Delta',
                'Parking Garage'
            ]
        })
    
    def train(self):
        """Main training pipeline"""
        print("Starting expense categorization model training...")
        
        # Load data
        df = self.load_data()
        
        # Preprocess data
        X, y = self.preprocess_data(df)
        
        # Train models
        results = self.train_models(X, y)
        
        # Hyperparameter tuning
        best_params = self.hyperparameter_tuning(X, y)
        
        # Save model
        self.save_model()
        
        print("Training completed!")
        print(f"Best model: {self.best_model.__class__.__name__}")
        print(f"Best accuracy: {self.best_score:.4f}")
        
        return results, best_params

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train expense categorization model')
    parser.add_argument('--data', required=True, help='Path to training data')
    parser.add_argument('--model-path', default='models/', help='Path to save models')
    parser.add_argument('--experiment-name', default='expense-categorization', help='MLflow experiment name')
    
    args = parser.parse_args()
    
    # Set MLflow experiment
    mlflow.set_experiment(args.experiment_name)
    
    # Train model
    trainer = ExpenseCategorizationTrainer(args.data, args.model_path)
    results, best_params = trainer.train()
    
    print("\nTraining Results:")
    for model_name, metrics in results.items():
        print(f"{model_name}: {metrics['accuracy']:.4f} accuracy")
    
    print("\nBest Parameters:")
    for model_name, params in best_params.items():
        print(f"{model_name}: {params}")

if __name__ == "__main__":
    main()





