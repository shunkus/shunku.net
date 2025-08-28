---
title: "HTML Cheatsheet: Essential Tags and Elements"
date: "2012-08-15"
updatedDate: "2025-01-10"
excerpt: "A comprehensive reference guide for HTML tags and elements with live previews. Perfect for quick lookups during web development projects."
tags: ["HTML", "Web Development", "Cheatsheet", "Frontend"]
author: "Shun Kushigami"
---

# HTML Cheatsheet: Essential Tags and Elements

HTML (HyperText Markup Language) is the foundation of web development. This cheatsheet provides a quick reference for the most commonly used HTML tags and elements with live previews.

## Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
<body>
    <!-- Content goes here -->
</body>
</html>
```

## Text Elements

### Headings
```html
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
<h4>Sub-subsection Heading</h4>
<h5>Minor Heading</h5>
<h6>Smallest Heading</h6>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<h1 style="margin: 5px 0;">Main Heading</h1>
<h2 style="margin: 5px 0;">Section Heading</h2>
<h3 style="margin: 5px 0;">Subsection Heading</h3>
<h4 style="margin: 5px 0;">Sub-subsection Heading</h4>
<h5 style="margin: 5px 0;">Minor Heading</h5>
<h6 style="margin: 5px 0;">Smallest Heading</h6>
</div>

### Paragraphs and Text Formatting
```html
<p>This is a paragraph.</p>
<strong>Bold text</strong>
<em>Emphasized text</em>
<b>Bold text (visual only)</b>
<i>Italic text (visual only)</i>
<u>Underlined text</u>
<mark>Highlighted text</mark>
<small>Small text</small>
<del>Deleted text</del>
<ins>Inserted text</ins>
<sub>Subscript</sub>
<sup>Superscript</sup>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<p>This is a paragraph.</p>
<p><strong>Bold text</strong> | <em>Emphasized text</em> | <b>Bold text (visual only)</b> | <i>Italic text (visual only)</i></p>
<p><u>Underlined text</u> | <mark>Highlighted text</mark> | <small>Small text</small></p>
<p><del>Deleted text</del> | <ins>Inserted text</ins> | H<sub>2</sub>O | E=mc<sup>2</sup></p>
</div>

## Lists

### Unordered List
```html
<ul>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ul>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<ul>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ul>
</div>

### Ordered List
```html
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>
</div>

### Definition List
```html
<dl>
    <dt>Term</dt>
    <dd>Definition</dd>
    <dt>Another term</dt>
    <dd>Another definition</dd>
</dl>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<dl>
    <dt><strong>HTML</strong></dt>
    <dd>HyperText Markup Language</dd>
    <dt><strong>CSS</strong></dt>
    <dd>Cascading Style Sheets</dd>
</dl>
</div>

## Links and Navigation

```html
<!-- External link -->
<a href="https://example.com">Visit Example</a>

<!-- Internal link -->
<a href="about.html">About Page</a>

<!-- Email link -->
<a href="mailto:user@example.com">Send Email</a>

<!-- Phone link -->
<a href="tel:+1234567890">Call Us</a>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<a href="#" style="color: #0066cc; text-decoration: underline;">Visit Example</a> | 
<a href="#" style="color: #0066cc; text-decoration: underline;">About Page</a> | 
<a href="#" style="color: #0066cc; text-decoration: underline;">Send Email</a> | 
<a href="#" style="color: #0066cc; text-decoration: underline;">Call Us</a>
</div>

## Tables

```html
<table>
    <thead>
        <tr>
            <th>Header 1</th>
            <th>Header 2</th>
            <th>Header 3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
        </tr>
        <tr>
            <td>Cell 4</td>
            <td>Cell 5</td>
            <td>Cell 6</td>
        </tr>
    </tbody>
</table>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<table style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">Header 1</th>
            <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">Header 2</th>
            <th style="border: 1px solid #ddd; padding: 8px; background: #f2f2f2;">Header 3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Cell 4</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cell 5</td>
            <td style="border: 1px solid #ddd; padding: 8px;">Cell 6</td>
        </tr>
    </tbody>
</table>
</div>

## Forms

```html
<form>
    <input type="text" placeholder="Username">
    <input type="password" placeholder="Password">
    <input type="email" placeholder="Email">
    <textarea placeholder="Your message"></textarea>
    <select>
        <option>Choose country</option>
        <option>United States</option>
        <option>Canada</option>
    </select>
    <button type="submit">Submit</button>
</form>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<form style="display: flex; flex-direction: column; gap: 10px; max-width: 300px;">
    <input type="text" placeholder="Username" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <input type="password" placeholder="Password" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <input type="email" placeholder="Email" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
    <textarea placeholder="Your message" rows="3" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
    <select style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <option>Choose country</option>
        <option>United States</option>
        <option>Canada</option>
    </select>
    <button type="button" style="padding: 10px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">Submit</button>
</form>
</div>

## Form Controls

### Radio Buttons and Checkboxes
```html
<!-- Radio buttons -->
<input type="radio" id="male" name="gender" value="male">
<label for="male">Male</label>
<input type="radio" id="female" name="gender" value="female">
<label for="female">Female</label>

<!-- Checkboxes -->
<input type="checkbox" id="newsletter" name="newsletter">
<label for="newsletter">Subscribe to newsletter</label>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<div style="margin-bottom: 10px;">
    <input type="radio" id="preview-male" name="preview-gender" value="male">
    <label for="preview-male">Male</label>
    <input type="radio" id="preview-female" name="preview-gender" value="female" style="margin-left: 15px;">
    <label for="preview-female">Female</label>
</div>
<div>
    <input type="checkbox" id="preview-newsletter" name="preview-newsletter">
    <label for="preview-newsletter">Subscribe to newsletter</label>
</div>
</div>

## Semantic HTML5 Elements

```html
<header>Header content</header>
<nav>Navigation menu</nav>
<main>Main content area</main>
<article>Article content</article>
<section>Section content</section>
<aside>Sidebar content</aside>
<footer>Footer content</footer>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #e8f4f8;"><strong>Header:</strong> Header content</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f0e8f8;"><strong>Nav:</strong> Navigation menu</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #e8f8e8;"><strong>Main:</strong> Main content area</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f8f0e8;"><strong>Article:</strong> Article content</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f8e8e8;"><strong>Section:</strong> Section content</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #e8e8f8;"><strong>Aside:</strong> Sidebar content</div>
<div style="border: 1px solid #ccc; margin: 5px 0; padding: 10px; background: #f8f8e8;"><strong>Footer:</strong> Footer content</div>
</div>

## Figure and Figcaption

```html
<figure>
    <img src="chart.jpg" alt="Sales Chart">
    <figcaption>2012 Sales Performance</figcaption>
</figure>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<figure style="margin: 0; text-align: center;">
    <div style="width: 200px; height: 120px; background: #ddd; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc;">
        [Image Placeholder]
    </div>
    <figcaption style="margin-top: 8px; font-style: italic; color: #666;">2012 Sales Performance</figcaption>
</figure>
</div>

## Common Attributes

- `id="unique-identifier"` - Unique identifier for element
- `class="class-name"` - CSS class for styling
- `style="css-properties"` - Inline CSS styling
- `title="tooltip-text"` - Tooltip text on hover
- `data-*="value"` - Custom data attributes

## Block vs Inline Elements

### Block Elements
```html
<div>Block element (takes full width)</div>
<p>Paragraph (block element)</p>
<h1>Heading (block element)</h1>
```

### Inline Elements
```html
<span>Inline element</span>
<a href="#">Link (inline)</a>
<strong>Bold text (inline)</strong>
```

**Preview:**
<div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;">
<div style="background: #ffe6e6; padding: 5px; margin: 5px 0; border: 1px solid #ffcccc;">Block element (takes full width)</div>
<p style="background: #ffe6e6; padding: 5px; margin: 5px 0; border: 1px solid #ffcccc;">Paragraph (block element)</p>
<div style="margin: 10px 0;">
    <span style="background: #e6f3ff; padding: 2px 5px; border: 1px solid #cce6ff;">Inline element</span>
    <a href="#" style="background: #e6f3ff; padding: 2px 5px; border: 1px solid #cce6ff; color: #0066cc; text-decoration: underline;">Link (inline)</a>
    <strong style="background: #e6f3ff; padding: 2px 5px; border: 1px solid #cce6ff;">Bold text (inline)</strong>
</div>
</div>

## Tips for Better HTML

1. **Use semantic elements** - Choose tags based on meaning, not appearance
2. **Always include alt text** for images for accessibility
3. **Validate your HTML** using online validators
4. **Use proper nesting** - ensure tags are properly closed
5. **Keep it simple** - don't over-complicate your markup

This cheatsheet covers the most essential HTML elements with live previews. The visual examples help you understand how each element renders in the browser. Keep it handy for quick reference while coding!