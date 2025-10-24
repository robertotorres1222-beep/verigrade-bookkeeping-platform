interface CDNConfig {
  baseUrl: string;
  apiKey?: string;
  version?: string;
  optimization?: {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'avif';
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    gravity?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
}

interface CDNResponse {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  optimized: boolean;
}

class CDNService {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = {
      version: 'v1',
      optimization: {
        quality: 80,
        format: 'webp',
        fit: 'cover',
        gravity: 'center',
      },
      ...config,
    };
  }

  /**
   * Optimize image URL with CDN parameters
   */
  optimizeImage(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png' | 'avif';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      gravity?: 'center' | 'top' | 'bottom' | 'left' | 'right';
      blur?: number;
      brightness?: number;
      contrast?: number;
      saturation?: number;
      hue?: number;
      gamma?: number;
      sharpen?: boolean;
      unsharp?: boolean;
      progressive?: boolean;
      strip?: boolean;
    } = {}
  ): string {
    const {
      width,
      height,
      quality = this.config.optimization?.quality,
      format = this.config.optimization?.format,
      fit = this.config.optimization?.fit,
      gravity = this.config.optimization?.gravity,
      blur,
      brightness,
      contrast,
      saturation,
      hue,
      gamma,
      sharpen,
      unsharp,
      progressive,
      strip,
    } = options;

    // Build CDN URL with parameters
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', quality.toString());
    if (format) params.set('f', format);
    if (fit) params.set('fit', fit);
    if (gravity) params.set('gravity', gravity);
    if (blur) params.set('blur', blur.toString());
    if (brightness) params.set('brightness', brightness.toString());
    if (contrast) params.set('contrast', contrast.toString());
    if (saturation) params.set('saturation', saturation.toString());
    if (hue) params.set('hue', hue.toString());
    if (gamma) params.set('gamma', gamma.toString());
    if (sharpen) params.set('sharpen', 'true');
    if (unsharp) params.set('unsharp', 'true');
    if (progressive) params.set('progressive', 'true');
    if (strip) params.set('strip', 'true');

    const baseUrl = this.config.baseUrl;
    const encodedImageUrl = encodeURIComponent(imageUrl);
    const queryString = params.toString();
    
    return `${baseUrl}/${this.config.version}/image/${encodedImageUrl}?${queryString}`;
  }

  /**
   * Generate responsive image URLs
   */
  generateResponsiveUrls(
    imageUrl: string,
    breakpoints: { width: number; height?: number }[],
    options: Parameters<CDNService['optimizeImage']>[1] = {}
  ): Array<{ url: string; width: number; height?: number; media?: string }> {
    return breakpoints.map(({ width, height }, index) => {
      const url = this.optimizeImage(imageUrl, { ...options, width, height });
      const media = index === 0 ? undefined : `(min-width: ${width}px)`;
      
      return { url, width, height, media };
    });
  }

  /**
   * Generate srcset for responsive images
   */
  generateSrcSet(
    imageUrl: string,
    breakpoints: { width: number; height?: number }[],
    options: Parameters<CDNService['optimizeImage']>[1] = {}
  ): string {
    return breakpoints
      .map(({ width, height }) => {
        const url = this.optimizeImage(imageUrl, { ...options, width, height });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Upload image to CDN
   */
  async uploadImage(
    file: File,
    options: {
      folder?: string;
      publicId?: string;
      tags?: string[];
      transformation?: Parameters<CDNService['optimizeImage']>[1];
    } = {}
  ): Promise<CDNResponse> {
    const { folder = 'uploads', publicId, tags = [], transformation } = options;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    if (publicId) formData.append('public_id', publicId);
    if (tags.length > 0) formData.append('tags', tags.join(','));
    
    if (this.config.apiKey) {
      formData.append('api_key', this.config.apiKey);
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/${this.config.version}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Apply transformations if specified
      let optimizedUrl = result.secure_url;
      if (transformation) {
        optimizedUrl = this.optimizeImage(result.secure_url, transformation);
      }

      return {
        url: optimizedUrl,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        optimized: !!transformation,
      };
    } catch (error) {
      console.error('CDN upload error:', error);
      throw error;
    }
  }

  /**
   * Delete image from CDN
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/${this.config.version}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: this.config.apiKey,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('CDN delete error:', error);
      return false;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(publicId: string): Promise<CDNResponse | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/${this.config.version}/resources/image/upload/${publicId}?api_key=${this.config.apiKey}`
      );

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      
      return {
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        optimized: false,
      };
    } catch (error) {
      console.error('CDN get info error:', error);
      return null;
    }
  }

  /**
   * Transform existing image
   */
  transformImage(
    publicId: string,
    transformation: Parameters<CDNService['optimizeImage']>[1]
  ): string {
    return this.optimizeImage(`${this.config.baseUrl}/image/upload/${publicId}`, transformation);
  }

  /**
   * Generate placeholder image
   */
  generatePlaceholder(
    width: number,
    height: number,
    options: {
      text?: string;
      backgroundColor?: string;
      textColor?: string;
      fontSize?: number;
    } = {}
  ): string {
    const {
      text = `${width}x${height}`,
      backgroundColor = 'f0f0f0',
      textColor = '666666',
      fontSize = 14,
    } = options;

    const params = new URLSearchParams();
    params.set('w', width.toString());
    params.set('h', height.toString());
    params.set('bg', backgroundColor);
    params.set('color', textColor);
    params.set('text', text);
    params.set('font_size', fontSize.toString());

    return `${this.config.baseUrl}/${this.config.version}/image/placeholder/${width}x${height}?${params.toString()}`;
  }

  /**
   * Generate blur placeholder
   */
  generateBlurPlaceholder(
    imageUrl: string,
    width: number = 20,
    height: number = 20,
    quality: number = 20
  ): string {
    return this.optimizeImage(imageUrl, {
      width,
      height,
      quality,
      format: 'jpeg',
      blur: 10,
      fit: 'cover',
    });
  }

  /**
   * Generate low-quality placeholder
   */
  generateLQIP(
    imageUrl: string,
    width: number = 20,
    height: number = 20
  ): string {
    return this.optimizeImage(imageUrl, {
      width,
      height,
      quality: 20,
      format: 'jpeg',
      blur: 5,
      fit: 'cover',
    });
  }

  /**
   * Check if image is optimized
   */
  isOptimized(imageUrl: string): boolean {
    return imageUrl.includes(this.config.baseUrl) && imageUrl.includes('?');
  }

  /**
   * Get original image URL from optimized URL
   */
  getOriginalUrl(optimizedUrl: string): string {
    if (!this.isOptimized(optimizedUrl)) {
      return optimizedUrl;
    }

    try {
      const url = new URL(optimizedUrl);
      const pathParts = url.pathname.split('/');
      const imagePath = pathParts[pathParts.length - 1];
      return decodeURIComponent(imagePath);
    } catch (error) {
      console.error('Error getting original URL:', error);
      return optimizedUrl;
    }
  }
}

// Create default CDN service instance
export const cdnService = new CDNService({
  baseUrl: process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://res.cloudinary.com/your-cloud',
  apiKey: process.env.NEXT_PUBLIC_CDN_API_KEY,
});

export default CDNService;






