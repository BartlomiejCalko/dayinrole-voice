import * as cheerio from 'cheerio';

interface ScrapedJobData {
  text: string;
  url: string;
  domain: string;
}

export async function scrapeJobOffer(url: string): Promise<ScrapedJobData> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    
    // Set up headers to mimic a real browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    // Fetch the webpage
    const response = await fetch(url, {
      headers,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract job content based on common patterns and specific sites
    let jobText = '';

    if (domain.includes('linkedin.com')) {
      jobText = extractLinkedInJob($);
    } else if (domain.includes('indeed.com')) {
      jobText = extractIndeedJob($);
    } else if (domain.includes('glassdoor.com')) {
      jobText = extractGlassdoorJob($);
    } else if (domain.includes('welcometothejungle.com')) {
      jobText = extractWelcomeToTheJungleJob($);
    } else if (domain.includes('jobs.lever.co')) {
      jobText = extractLeverJob($);
    } else if (domain.includes('boards.greenhouse.io')) {
      jobText = extractGreenhouseJob($);
    } else {
      jobText = extractGenericJob($);
    }

    if (!jobText.trim()) {
      throw new Error('Could not extract job content from the provided URL');
    }

    return {
      text: jobText.trim(),
      url,
      domain
    };

  } catch (error) {
    console.error('Error scraping job offer:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error('Unable to access the job posting URL. Please check if the URL is correct and publicly accessible.');
      }
      throw error;
    }
    
    throw new Error('Failed to extract job posting content from the provided URL');
  }
}

function extractLinkedInJob($: cheerio.CheerioAPI): string {
  // LinkedIn job posting selectors
  const selectors = [
    '.jobs-search__job-details--container',
    '.job-details-jobs-unified-top-card__container',
    '.jobs-unified-top-card__content',
    '.jobs-box__html-content',
    '.jobs-description__content',
    '.jobs-description',
    '.job-view-layout',
    'main[role="main"]'
  ];

  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  // Fallback: extract from common content areas
  if (!content) {
    content = $('body').text().trim();
  }

  return cleanJobText(content);
}

function extractIndeedJob($: cheerio.CheerioAPI): string {
  const selectors = [
    '[data-testid="jobsearch-JobComponent"]',
    '.jobsearch-jobDescriptionText',
    '.jobsearch-JobComponent-description',
    '#jobDescriptionText',
    '.jobDescriptionContent',
    '.job_summary',
    '.summary'
  ];

  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  if (!content) {
    content = $('body').text().trim();
  }

  return cleanJobText(content);
}

function extractGlassdoorJob($: cheerio.CheerioAPI): string {
  const selectors = [
    '[data-test="job-description"]',
    '.jobDescriptionContent',
    '.desc',
    '.jobDesc',
    '#JobDescContainer',
    '.jobDescription'
  ];

  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  if (!content) {
    content = $('body').text().trim();
  }

  return cleanJobText(content);
}

function extractWelcomeToTheJungleJob($: cheerio.CheerioAPI): string {
  const selectors = [
    '[data-testid="job-description"]',
    '.sc-job-description',
    '.job-description',
    '.description-content',
    '.job-content'
  ];

  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  if (!content) {
    content = $('body').text().trim();
  }

  return cleanJobText(content);
}

function extractLeverJob($: cheerio.CheerioAPI): string {
  const selectors = [
    '.section-wrapper',
    '.content',
    '.posting-requirements',
    '.posting-description',
    '.section'
  ];

  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  if (!content) {
    content = $('body').text().trim();
  }

  return cleanJobText(content);
}

function extractGreenhouseJob($: cheerio.CheerioAPI): string {
  const selectors = [
    '#content',
    '.content',
    '.application',
    '.job-post'
  ];

  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 100) break;
    }
  }

  if (!content) {
    content = $('body').text().trim();
  }

  return cleanJobText(content);
}

function extractGenericJob($: cheerio.CheerioAPI): string {
  // Generic extraction for other job sites
  const selectors = [
    'main',
    '[role="main"]',
    '.job-description',
    '.job-details',
    '.job-content',
    '.description',
    '.content',
    '#content',
    '.posting',
    '.job-posting',
    'article',
    '.job'
  ];

  let content = '';
  
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text().trim();
      if (content.length > 200) break;
    }
  }

  // Final fallback
  if (!content) {
    // Remove navigation, header, footer elements
    $('nav, header, footer, .nav, .header, .footer, .menu, .sidebar').remove();
    content = $('body').text().trim();
  }

  return cleanJobText(content);
}

function cleanJobText(text: string): string {
  return text
    // Remove extra whitespace and line breaks
    .replace(/\s+/g, ' ')
    // Remove common noise
    .replace(/Cookie Policy|Privacy Policy|Terms of Service|Sign in|Sign up|Apply now|Save job|Share/gi, '')
    // Remove navigation text
    .replace(/Home|Jobs|About|Contact|Search|Filter|Sort|Menu/gi, '')
    // Clean up
    .trim();
}

export function isJobUrl(input: string): boolean {
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase();
    
    // Check for common job board domains
    const jobSites = [
      'linkedin.com',
      'indeed.com',
      'glassdoor.com',
      'welcometothejungle.com',
      'jobs.lever.co',
      'boards.greenhouse.io',
      'workable.com',
      'bamboohr.com',
      'smartrecruiters.com',
      'jobvite.com',
      'careers.',
      'jobs.'
    ];

    return jobSites.some(site => hostname.includes(site)) || 
           url.pathname.toLowerCase().includes('job') ||
           url.pathname.toLowerCase().includes('career');
  } catch {
    return false;
  }
} 