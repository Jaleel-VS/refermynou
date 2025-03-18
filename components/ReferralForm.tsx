"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ReferralForm({ limitReached }: { limitReached: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (limitReached) {
      setError("Maximum number of referrals reached");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const response = await fetch("/api/referrals", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      
      setSuccess(true);
      formRef.current?.reset();
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (limitReached) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">Sorry!</h2>
        <p className="mb-6 text-muted-foreground">I've reached the maximum amount of referrals :(</p>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold mb-4">Thank You!</h2>
        <p className="mb-6 text-muted-foreground">Your referral has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className="space-y-6 w-full max-w-md mx-auto"
    >
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-md text-sm mb-4">
        <p>Note: Only one referral per user is allowed.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Please take a screenshot of the application confirmation email</Label>
        <div className="flex flex-col items-center gap-4">
          {imagePreview && (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border border-border">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            required
            onChange={handleImageChange}
            className="cursor-pointer"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullname">Full Name</Label>
        <Input
          id="fullname"
          name="fullname"
          type="text"
          required
          placeholder="Teko Modise"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="teko@teko.co.za"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Cellpone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+27 61 123 4567"
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Referral"
        )}
      </Button>
    </form>
  );
} 