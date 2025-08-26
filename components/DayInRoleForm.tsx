"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isJobUrl } from "@/lib/scrapeJobOffer";
import { Link2, FileText } from "lucide-react";

const DayInRoleForm = ({ onSubmit, isLoading = false }: DayInRoleFormProps) => {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<'original' | 'english'>('original');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');

  // Auto-detect if input is a URL
  useEffect(() => {
    const type = isJobUrl(input.trim()) ? 'url' : 'text';
    setInputType(type);
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim(), language, inputType);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto sm:rounded-lg rounded-lg sm:border md:border">
      <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
        {/* <CardTitle className="text-2xl font-semibold">Create Day in Role</CardTitle> */}
        <CardDescription>
          
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pt-0 sm:pt-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="jobOffer" className="text-sm font-medium text-foreground flex items-center gap-2 px-4 sm:px-0">
              {inputType === 'url' ? (
                <>
                  <Link2 className="w-4 h-4 text-blue-500" />
                  <span className="hidden sm:inline">Job Posting URL</span>
                  <span className="sm:hidden">URL</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="hidden sm:inline">Job Offer Text or URL</span>
                  <span className="sm:hidden">Text or URL</span>
                </>
              )}
            </label>
            <div className="sm:px-0">
              <Textarea
                id="jobOffer"
                placeholder={inputType === 'url' 
                  ? "Paste a job posting URL here (e.g., from LinkedIn, Indeed, Glassdoor)..." 
                  : "Paste the job offer text or URL here..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[260px] resize-none rounded-none sm:rounded-md border-0 border-b sm:border sm:border-input focus-visible:ring-0 focus-visible:ring-offset-0 px-4 sm:px-3 py-4 sm:py-2"
                disabled={isLoading}
                required
              />
            </div>
            <div className="flex flex-col gap-2 px-4 sm:px-0">
              {inputType === 'url' ? (
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 sm:flex">
                  <Link2 className="w-3 h-3" />
                  <span className="hidden sm:inline">URL detected! We'll extract the job posting content automatically.</span>
                  <span className="sm:hidden">URL detected.</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  💡 Tip: You can paste either a job posting URL or the job offer text directly.
                </p>
              )}
              <p className="text-xs text-muted-foreground hidden sm:block">
                🔍 For best results, include company name, position title, requirements, responsibilities, and tech stack.
              </p>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3 px-4 sm:px-0">
            <label className="text-sm font-medium text-foreground">
              Response Language
            </label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="original"
                  checked={language === 'original'}
                  onChange={(e) => setLanguage(e.target.value as 'original' | 'english')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                  disabled={isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Original Language</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Generate response in the same language as the job offer</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value="english"
                  checked={language === 'english'}
                  onChange={(e) => setLanguage(e.target.value as 'original' | 'english')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                  disabled={isLoading}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">English</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Generate response in English regardless of input language</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="px-4 sm:px-0">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {inputType === 'url' ? 'Extracting & Generating...' : 'Generating Day in Role...'}
                </>
              ) : (
                inputType === 'url' ? 'Extract & Generate Day in Role' : 'Generate Day in Role'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DayInRoleForm; 