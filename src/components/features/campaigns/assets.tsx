"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  ArrowRight, 
  CheckCircle, 
  FileImage, 
  FileText, 
  Download,
  Trash2,
  Image,
  File
} from "lucide-react";
import { CampaignSectionProps, SectionValidation } from "./types";

interface AssetsProps extends Omit<CampaignSectionProps, 'activeSection'> {
  assetsValidation: SectionValidation;
}

export function Assets({
  campaign,
  campaignId,
  sectionData,
  setSectionData,
  editingSection,
  setEditingSection,
  savingSection,
  saveSection,
  startEditing,
  cancelEditing,
  setActiveSection,
  assetsValidation
}: AssetsProps) {

  const handleFileUpload = (type: 'logos' | 'brand_kit' | 'example_content', event?: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target.files;
    if (files && files.length > 0) {
      // TODO: Implement actual file upload to server
      const fileNames = Array.from(files).map(file => file.name);
      const currentFiles = sectionData.shared_files?.[type] || [];
      
      setSectionData(prev => ({
        ...prev,
        shared_files: {
          ...prev.shared_files,
          [type]: [...currentFiles, ...fileNames]
        }
      }));
    }
  };

  const triggerFileInput = (type: 'logos' | 'brand_kit' | 'example_content') => {
    const input = document.getElementById(`${type}-upload`) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const handleFileRemove = (type: 'logos' | 'brand_kit' | 'example_content', index: number) => {
    const currentFiles = sectionData.shared_files?.[type] || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    
    setSectionData(prev => ({
      ...prev,
      shared_files: {
        ...prev.shared_files,
        [type]: updatedFiles
      }
    }));
  };

  const renderFileSection = (
    title: string,
    description: string,
    type: 'logos' | 'brand_kit' | 'example_content',
    icon: React.ReactNode,
    acceptedTypes: string = "image/*"
  ) => {
    const files = sectionData.shared_files?.[type] || [];

    return (
      <Card className="border border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Hidden file input */}
            <Input
              id={`${type}-upload`}
              type="file"
              multiple
              accept={acceptedTypes}
              className="hidden"
              onChange={(e) => handleFileUpload(type, e)}
            />

            {/* Clickable upload area */}
            <div 
              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer hover:bg-primary/5"
              onClick={() => triggerFileInput(type)}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  <span className="text-primary hover:text-primary/80 font-medium">
                    Click to upload files
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {acceptedTypes === "image/*" ? "Images only" : "Any file type"} • Max 10MB per file
                  </p>
                </div>
              </div>
            </div>

            {/* Current Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Uploaded Files</Label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                          {acceptedTypes === "image/*" ? (
                            <Image className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file}</p>
                          <p className="text-xs text-muted-foreground">Uploaded file</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileRemove(type, index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Full Width Top Bar */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 -mx-6 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Assets</h2>
                  {assetsValidation.isCompleted && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </div>
                  )}
                </div>
                <p className="text-base text-muted-foreground mt-1">
                  Upload and manage brand assets, logos, and reference materials for creators
                </p>
              </div>
            </div>
            {assetsValidation.isCompleted && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {assetsValidation.completedFields.length} of {assetsValidation.totalFields} sections complete
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveSection('communication-assets')}
                  className="h-8"
                >
                  Next: Communication
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assets Sections */}
      <div className="max-w-4xl mx-auto space-y-6">
        {renderFileSection(
          "Brand Logos",
          "Upload your brand logos in various formats and sizes for creator use",
          "logos",
          <FileImage className="h-4 w-4 text-primary" />,
          "image/*"
        )}

        {renderFileSection(
          "Brand Kit",
          "Complete brand guidelines, color palettes, fonts, and style guides",
          "brand_kit",
          <FileText className="h-4 w-4 text-primary" />,
          "*/*"
        )}

        {renderFileSection(
          "Example Content",
          "Reference videos, images, or content examples to guide creators",
          "example_content",
          <Image className="h-4 w-4 text-primary" />,
          "*/*"
        )}
      </div>
    </div>
  );
}
