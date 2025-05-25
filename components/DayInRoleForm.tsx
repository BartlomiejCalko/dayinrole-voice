"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DayInRoleForm = ({ onSubmit, isLoading = false }: DayInRoleFormProps) => {
  const [jobOfferText, setJobOfferText] = useState("");
  const [language, setLanguage] = useState<'original' | 'english'>('original');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobOfferText.trim()) {
      onSubmit(jobOfferText.trim(), language);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Create Day in Role</CardTitle>
        <CardDescription>
          
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="jobOffer" className="text-sm font-medium text-foreground">
              
            </label>
            <Textarea
              id="jobOffer"
              placeholder="Paste the job offer text here..."
              value={jobOfferText}
              onChange={(e) => setJobOfferText(e.target.value)}
              className="min-h-[250px] resize-none"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: Include company name, position title, requirements, responsibilities, and tech stack for the best results.
            </p>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
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
                  <span className="text-xs text-muted-foreground">Generate response in the same language as the job offer</span>
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
                  <span className="text-xs text-muted-foreground">Generate response in English regardless of input language</span>
                </div>
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!jobOfferText.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Day in Role...
              </>
            ) : (
              "Generate Day in Role"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DayInRoleForm; 