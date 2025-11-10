const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');

describe('Integration Tests', () => {
  test('Should integrate Yale to Fale replacement logic correctly', () => {
    const $ = cheerio.load(sampleHtmlWithYale);
    
    // Apply the same logic as in app.js
    $('body *').contents().filter(function() {
      return this.nodeType === 3; // Text nodes only
    }).each(function() {
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    // Process title separately
    const title = $('title').text().replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
    $('title').text(title);
    
    const modifiedHtml = $.html();
    
    // Verify Yale has been replaced with Fale in text
    expect($('title').text()).toBe('Fale University Test Page');
    expect($('h1').text()).toBe('Welcome to Fale University');
    expect($('p').first().text()).toContain('Fale University is a private');
    
    // Verify URLs remain unchanged
    const links = $('a');
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('yale.edu')) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);
    
    // Verify link text is changed
    expect($('a').first().text()).toBe('About Fale');
    
    // Verify script content is processed
    expect(modifiedHtml).toContain('name: "Fale University"');
    expect(modifiedHtml).toContain('This is " + faleInfo.name');
  });

  test('Should preserve HTML structure during replacement', () => {
    const complexHtml = `
      <div class="yale-container">
        <h2>Yale Information</h2>
        <p>Yale University <strong>Yale</strong> is located in <em>New Haven</em>.</p>
        <a href="https://yale.edu">Visit Yale</a>
      </div>
    `;
    
    const $ = cheerio.load(complexHtml);
    
    // Apply replacement logic
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale');
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    const result = $.html();
    
    // Text should be replaced
    expect(result).toContain('Fale Information');
    expect(result).toContain('Fale University');
    expect(result).toContain('<strong>Fale</strong>');
    expect(result).toContain('Visit Fale');
    
    // URLs should remain unchanged
    expect(result).toContain('href="https://yale.edu"');
    
    // HTML structure should be preserved
    expect(result).toContain('<div class="yale-container">');
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>New Haven</em>');
  });
});
