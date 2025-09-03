import {
  generateGradientOptions,
  generateSVGGradient,
  generateGradientDataURL,
  generateCSSGradient,
  generateBookSeed,
  GradientOptions,
} from '../../lib/gradient-generator';

describe('gradient-generator.ts', () => {
  describe('generateGradientOptions', () => {
    it('generates consistent gradient options for the same seed', () => {
      const seed = 'test-seed';
      const options1 = generateGradientOptions(seed);
      const options2 = generateGradientOptions(seed);
      
      expect(options1).toEqual(options2);
    });

    it('applies default options', () => {
      const options = generateGradientOptions('test');
      
      expect(options.width).toBe(300);
      expect(options.height).toBe(400);
      expect(options.colors).toHaveLength(2);
      expect(options.direction).toMatch(/^to-(r|br|b|bl|l|tl|t|tr)$/);
      expect(options.seed).toBe('test');
    });

    it('uses custom options when provided', () => {
      const customOptions: GradientOptions = {
        width: 500,
        height: 600,
        colors: ['#ff0000', '#00ff00', '#0000ff'],
        direction: 'to-br',
        seed: 'custom-seed',
      };
      
      const options = generateGradientOptions('original-seed', customOptions);
      
      expect(options.width).toBe(500);
      expect(options.height).toBe(600);
      expect(options.colors).toEqual(['#ff0000', '#00ff00', '#0000ff']);
      expect(options.direction).toBe('to-br');
      expect(options.seed).toBe('custom-seed');
    });

    it('partially overrides default options', () => {
      const customOptions: GradientOptions = {
        width: 800,
        colors: ['#purple', '#pink'],
      };
      
      const options = generateGradientOptions('test', customOptions);
      
      expect(options.width).toBe(800);
      expect(options.height).toBe(400); // default
      expect(options.colors).toEqual(['#purple', '#pink']);
      expect(options.direction).toMatch(/^to-(r|br|b|bl|l|tl|t|tr)$/); // deterministic based on seed
      expect(options.seed).toBe('test');
    });

    it('generates different options for different seeds', () => {
      const options1 = generateGradientOptions('seed1');
      const options2 = generateGradientOptions('seed2');
      
      // At least one property should be different (most likely colors or direction)
      const isDifferent = 
        options1.colors !== options2.colors || 
        options1.direction !== options2.direction;
      
      expect(isDifferent).toBe(true);
    });

    it('handles empty seed', () => {
      const options = generateGradientOptions('');
      
      expect(options).toBeDefined();
      expect(options.width).toBe(300);
      expect(options.height).toBe(400);
      expect(options.colors).toHaveLength(2);
      expect(options.seed).toBe('');
    });
  });

  describe('generateSVGGradient', () => {
    it('generates valid SVG with default options', () => {
      const svg = generateSVGGradient({ seed: 'test' });
      
      expect(svg).toContain('<svg');
      expect(svg).toContain('width="300"');
      expect(svg).toContain('height="400"');
      expect(svg).toContain('<linearGradient');
      expect(svg).toContain('<stop');
      expect(svg).toContain('</svg>');
    });

    it('generates SVG with custom dimensions', () => {
      const svg = generateSVGGradient({ 
        seed: 'test',
        width: 200,
        height: 300,
      });
      
      expect(svg).toContain('width="200"');
      expect(svg).toContain('height="300"');
      expect(svg).toContain('viewBox="0 0 200 300"');
    });

    it('generates SVG with custom colors', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      const svg = generateSVGGradient({ 
        seed: 'test',
        colors,
      });
      
      expect(svg).toContain('stop-color:#ff0000');
      expect(svg).toContain('stop-color:#00ff00');
      expect(svg).toContain('stop-color:#0000ff');
    });

    it('generates correct gradient stops for multiple colors', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff'];
      const svg = generateSVGGradient({ 
        seed: 'test',
        colors,
      });
      
      expect(svg).toContain('offset="0%"');
      expect(svg).toContain('offset="50%"');
      expect(svg).toContain('offset="100%"');
    });

    it('generates SVG with different directions', () => {
      const directions = ['to-r', 'to-br', 'to-b', 'to-bl'] as const;
      
      directions.forEach(direction => {
        const svg = generateSVGGradient({ 
          seed: 'test',
          direction,
        });
        
        expect(svg).toContain('<linearGradient');
        expect(svg).toContain('x1=');
        expect(svg).toContain('y1=');
        expect(svg).toContain('x2=');
        expect(svg).toContain('y2=');
      });
    });

    it('generates consistent SVG for the same options', () => {
      const options = { seed: 'consistent-test', width: 400, height: 500 };
      const svg1 = generateSVGGradient(options);
      const svg2 = generateSVGGradient(options);
      
      expect(svg1).toBe(svg2);
    });

    it('handles to-r direction correctly', () => {
      const svg = generateSVGGradient({ 
        seed: 'test',
        direction: 'to-r',
      });
      
      expect(svg).toContain('x1="0%"');
      expect(svg).toContain('y1="0%"');
      expect(svg).toContain('x2="100%"');
      expect(svg).toContain('y2="0%"');
    });

    it('handles to-br direction correctly', () => {
      const svg = generateSVGGradient({ 
        seed: 'test',
        direction: 'to-br',
      });
      
      expect(svg).toContain('x1="0%"');
      expect(svg).toContain('y1="0%"');
      expect(svg).toContain('x2="100%"');
      expect(svg).toContain('y2="100%"');
    });
  });

  describe('generateGradientDataURL', () => {
    it('generates valid data URL', () => {
      const dataURL = generateGradientDataURL({ seed: 'test' });
      
      expect(dataURL).toMatch(/^data:image\/svg\+xml,/);
      expect(dataURL).toContain('%3Csvg');
      expect(dataURL).toContain('%3C%2Fsvg%3E'); // Corrected URL encoding for </svg>
    });

    it('generates consistent data URL for same options', () => {
      const options = { seed: 'consistent-test' };
      const dataURL1 = generateGradientDataURL(options);
      const dataURL2 = generateGradientDataURL(options);
      
      expect(dataURL1).toBe(dataURL2);
    });

    it('encodes SVG content properly', () => {
      const dataURL = generateGradientDataURL({ 
        seed: 'test',
        colors: ['#ff0000', '#00ff00'],
      });
      
      expect(dataURL).toContain('%23ff0000'); // encoded #ff0000
      expect(dataURL).toContain('%2300ff00'); // encoded #00ff00
    });
  });

  describe('generateCSSGradient', () => {
    it('generates valid CSS gradient', () => {
      const css = generateCSSGradient({ seed: 'test' });
      
      expect(css).toMatch(/^linear-gradient\(/);
      expect(css).toContain(', #');
      expect(css).toContain(')');
    });

    it('uses custom colors in CSS gradient', () => {
      const colors = ['#ff0000', '#00ff00'];
      const css = generateCSSGradient({ 
        seed: 'test',
        colors,
      });
      
      expect(css).toContain('#ff0000, #00ff00');
    });

    it('converts directions to CSS format correctly', () => {
      const testCases = [
        { direction: 'to-r' as const, expected: 'to right' },
        { direction: 'to-l' as const, expected: 'to left' },
        { direction: 'to-b' as const, expected: 'to bottom' },
        { direction: 'to-t' as const, expected: 'to top' },
        { direction: 'to-br' as const, expected: 'to bottom right' },
        { direction: 'to-bl' as const, expected: 'to bottom left' },
        { direction: 'to-tr' as const, expected: 'to top right' },
        { direction: 'to-tl' as const, expected: 'to top left' },
      ];
      
      testCases.forEach(({ direction, expected }) => {
        const css = generateCSSGradient({ 
          seed: 'test',
          direction,
        });
        
        expect(css).toContain(expected);
      });
    });

    it('handles multiple colors in CSS gradient', () => {
      const colors = ['#red', '#green', '#blue'];
      const css = generateCSSGradient({ 
        seed: 'test',
        colors,
      });
      
      expect(css).toContain('#red, #green, #blue');
    });

    it('generates consistent CSS for same options', () => {
      const options = { seed: 'consistent-test' };
      const css1 = generateCSSGradient(options);
      const css2 = generateCSSGradient(options);
      
      expect(css1).toBe(css2);
    });
  });

  describe('generateBookSeed', () => {
    it('generates seed from title and author', () => {
      const seed = generateBookSeed('My Book Title', 'John Doe');
      
      expect(seed).toBe('My Book Title-John Doe');
    });

    it('handles missing author', () => {
      const seed = generateBookSeed('My Book Title');
      
      expect(seed).toBe('My Book Title-unknown');
    });

    it('handles undefined author', () => {
      const seed = generateBookSeed('My Book Title', undefined);
      
      expect(seed).toBe('My Book Title-unknown');
    });

    it('handles empty author string', () => {
      const seed = generateBookSeed('My Book Title', '');
      
      expect(seed).toBe('My Book Title-unknown'); // Empty string is falsy, so || 'unknown' applies
    });

    it('generates consistent seeds for same inputs', () => {
      const seed1 = generateBookSeed('Title', 'Author');
      const seed2 = generateBookSeed('Title', 'Author');
      
      expect(seed1).toBe(seed2);
    });

    it('generates different seeds for different inputs', () => {
      const seed1 = generateBookSeed('Title 1', 'Author');
      const seed2 = generateBookSeed('Title 2', 'Author');
      
      expect(seed1).not.toBe(seed2);
    });

    it('handles special characters in title and author', () => {
      const seed = generateBookSeed('Title with "quotes" & symbols', 'Author O\'Connor');
      
      expect(seed).toBe('Title with "quotes" & symbols-Author O\'Connor');
    });

    it('handles unicode characters', () => {
      const seed = generateBookSeed('日本語のタイトル', '著者名');
      
      expect(seed).toBe('日本語のタイトル-著者名');
    });
  });

  describe('integration tests', () => {
    it('generates consistent gradient across all functions for same seed', () => {
      const seed = 'integration-test';
      const options = { seed };
      
      const gradientOptions = generateGradientOptions(seed);
      const svg = generateSVGGradient(options);
      const dataURL = generateGradientDataURL(options);
      const css = generateCSSGradient(options);
      
      // All should use the same colors from gradientOptions
      const colors = gradientOptions.colors;
      colors.forEach(color => {
        expect(svg).toContain(color);
        expect(dataURL).toContain(encodeURIComponent(color));
        expect(css).toContain(color);
      });
    });

    it('book seed integration with gradient generation', () => {
      const title = 'Learn React in 30 Days';
      const author = 'Jane Smith';
      const bookSeed = generateBookSeed(title, author);
      
      const svg = generateSVGGradient({ seed: bookSeed });
      const dataURL = generateGradientDataURL({ seed: bookSeed });
      const css = generateCSSGradient({ seed: bookSeed });
      
      // All should be consistent for the same book
      expect(svg).toBeDefined();
      expect(dataURL).toBeDefined();
      expect(css).toBeDefined();
      
      // Should generate the same results when called again
      const svg2 = generateSVGGradient({ seed: bookSeed });
      const dataURL2 = generateGradientDataURL({ seed: bookSeed });
      const css2 = generateCSSGradient({ seed: bookSeed });
      
      expect(svg).toBe(svg2);
      expect(dataURL).toBe(dataURL2);
      expect(css).toBe(css2);
    });
  });
});