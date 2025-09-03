import Document from '../../pages/_document';

describe('_document.tsx', () => {
  it('exports a valid Document component', () => {
    expect(Document).toBeDefined();
    expect(typeof Document).toBe('function');
  });

  it('has the correct component structure', () => {
    // Test that the component can be instantiated
    expect(() => Document).not.toThrow();
  });

  it('contains expected meta tag content in source', () => {
    // Since _document is server-side rendered, we test the source code structure
    const documentSource = Document.toString();
    
    expect(documentSource).toContain('Portfolio of Shun Kushigami');
    expect(documentSource).toContain('Cloud Support Engineer');
    expect(documentSource).toContain('Software Engineer');
    expect(documentSource).toContain('AWS');
    expect(documentSource).toContain('JavaScript');
    expect(documentSource).toContain('Python');
  });

  it('contains Open Graph meta tags in source', () => {
    const documentSource = Document.toString();
    
    expect(documentSource).toContain('og:title');
    expect(documentSource).toContain('og:description');
    expect(documentSource).toContain('og:type');
    expect(documentSource).toContain('og:locale');
  });

  it('contains proper HTML structure elements in source', () => {
    const documentSource = Document.toString();
    
    // Check for Next.js Document components (compiled form)
    expect(documentSource).toContain('_document.Html');
    expect(documentSource).toContain('_document.Head');
    expect(documentSource).toContain('_document.Main');
    expect(documentSource).toContain('_document.NextScript');
    expect(documentSource).toContain('lang');
  });

  describe('JSX Structure Tests', () => {
    it('returns a JSX element with correct structure', () => {
      const result = Document();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.type).toBeDefined();
    });

    it('uses Html component as root element', () => {
      const result = Document();
      
      // Check if the component uses Html as the root
      expect(result.type.toString()).toContain('Html');
    });

    it('sets correct props on Html element', () => {
      const result = Document();
      
      expect(result.props.lang).toBe('en');
    });

    it('contains Head component with meta tags', () => {
      const result = Document();
      const children = result.props.children;
      
      // Find Head component
      const headComponent = children.find((child: any) => child.type.toString().includes('Head'));
      expect(headComponent).toBeDefined();
      
      // Check meta tags exist
      const metaTags = headComponent.props.children;
      expect(Array.isArray(metaTags)).toBe(true);
      expect(metaTags.length).toBeGreaterThan(0);
    });

    it('includes all required meta tags', () => {
      const result = Document();
      const children = result.props.children;
      const headComponent = children.find((child: any) => child.type.toString().includes('Head'));
      const metaTags = headComponent.props.children;
      
      const metaNames = metaTags.map((tag: any) => tag.props?.name || tag.props?.property).filter(Boolean);
      
      expect(metaNames).toContain('description');
      expect(metaNames).toContain('keywords'); 
      expect(metaNames).toContain('author');
      expect(metaNames).toContain('og:title');
      expect(metaNames).toContain('og:description');
      expect(metaNames).toContain('og:type');
      expect(metaNames).toContain('og:locale');
    });

    it('has correct meta tag content values', () => {
      const result = Document();
      const children = result.props.children;
      const headComponent = children.find((child: any) => child.type.toString().includes('Head'));
      const metaTags = headComponent.props.children;
      
      const descriptionTag = metaTags.find((tag: any) => tag.props?.name === 'description');
      const keywordsTag = metaTags.find((tag: any) => tag.props?.name === 'keywords');
      const authorTag = metaTags.find((tag: any) => tag.props?.name === 'author');
      
      expect(descriptionTag.props.content).toContain('Shun Kushigami');
      expect(descriptionTag.props.content).toContain('Cloud Support Engineer');
      expect(keywordsTag.props.content).toContain('AWS');
      expect(keywordsTag.props.content).toContain('JavaScript');
      expect(authorTag.props.content).toBe('Shun Kushigami');
    });

    it('includes correct Open Graph properties', () => {
      const result = Document();
      const children = result.props.children;
      const headComponent = children.find((child: any) => child.type.toString().includes('Head'));
      const metaTags = headComponent.props.children;
      
      const ogTitleTag = metaTags.find((tag: any) => tag.props?.property === 'og:title');
      const ogTypeTag = metaTags.find((tag: any) => tag.props?.property === 'og:type');
      const ogLocaleTag = metaTags.find((tag: any) => tag.props?.property === 'og:locale');
      
      expect(ogTitleTag.props.content).toContain('Shun Kushigami');
      expect(ogTypeTag.props.content).toBe('website');
      expect(ogLocaleTag.props.content).toBe('en_US');
    });

    it('contains body element with Main and NextScript', () => {
      const result = Document();
      const children = result.props.children;
      
      const bodyComponent = children.find((child: any) => child.type === 'body');
      expect(bodyComponent).toBeDefined();
      
      const bodyChildren = bodyComponent.props.children;
      const hasMain = bodyChildren.some((child: any) => child.type.toString().includes('Main'));
      const hasNextScript = bodyChildren.some((child: any) => child.type.toString().includes('NextScript'));
      
      expect(hasMain).toBe(true);
      expect(hasNextScript).toBe(true);
    });

    it('maintains proper component hierarchy', () => {
      const result = Document();
      
      // Root should be Html
      expect(result.type.toString()).toContain('Html');
      
      // Should have exactly 2 children: Head and body
      const children = result.props.children;
      expect(Array.isArray(children)).toBe(true);
      expect(children).toHaveLength(2);
      
      const [headComponent, bodyComponent] = children;
      expect(headComponent.type.toString()).toContain('Head');
      expect(bodyComponent.type).toBe('body');
    });

    it('validates all meta tag structures', () => {
      const result = Document();
      const children = result.props.children;
      const headComponent = children.find((child: any) => child.type.toString().includes('Head'));
      const metaTags = headComponent.props.children;
      
      // All meta tags should have proper structure
      metaTags.forEach((tag: any) => {
        expect(tag.type).toBe('meta');
        expect(tag.props).toBeDefined();
        expect(tag.props.content).toBeDefined();
        expect(tag.props.name || tag.props.property).toBeDefined();
      });
    });

    it('renders component without throwing errors', () => {
      expect(() => {
        const result = Document();
        expect(result).toBeDefined();
      }).not.toThrow();
    });
  });
});