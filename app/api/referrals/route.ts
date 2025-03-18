import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Function to ensure the storage bucket exists
async function ensureBucketExists(supabase: any, bucketName: string) {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some((bucket: any) => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} does not exist and cannot be created automatically due to permissions.`);
      console.log(`Please create the bucket manually in the Supabase dashboard.`);
      throw new Error(`Storage bucket "${bucketName}" does not exist`);
    }
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fullname = formData.get("fullname") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const image = formData.get("image") as File;

    if (!fullname || !email || !phone || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check file size (max 2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Image size exceeds the 2MB limit (current size: ${(image.size / (1024 * 1024)).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${image.type}. Allowed types: JPEG, PNG, GIF, WEBP` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user has already submitted a referral
    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingReferral) {
      return NextResponse.json(
        { error: "You have already submitted a referral. Only one referral per user is allowed." },
        { status: 400 }
      );
    }

    // Check for existing referrals count
    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true });

    if (count !== null && count >= 5) {
      return NextResponse.json(
        { error: "Maximum number of referrals reached" },
        { status: 403 }
      );
    }

    // Ensure the storage bucket exists
    const bucketName = "referral-images";
    try {
      await ensureBucketExists(supabase, bucketName);
    } catch (error) {
      console.error("Failed to ensure bucket exists:", error);
      return NextResponse.json(
        { error: "Storage bucket does not exist. Please create the 'referral-images' bucket in Supabase dashboard." },
        { status: 500 }
      );
    }

    // Upload image to Supabase Storage
    const fileName = `${Date.now()}-${image.name}`;
    console.log(`Attempting to upload image: ${fileName}, type: ${image.type}, size: ${image.size}`);
    
    // Convert File to ArrayBuffer for reliable upload to Supabase
    const arrayBuffer = await image.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: image.type,
        cacheControl: "3600"
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Insert the referral data
    const { data, error } = await supabase.from("referrals").insert([
      {
        fullname,
        email,
        phone,
        image_url: publicUrl,
      },
    ]);

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json(
        { error: `Failed to save referral: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving referral:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check for existing referrals count
    const { count } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true });
    
    return NextResponse.json({ 
      count: count || 0,
      limitReached: count !== null && count >= 5 
    });
  } catch (error) {
    console.error("Error checking referrals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 