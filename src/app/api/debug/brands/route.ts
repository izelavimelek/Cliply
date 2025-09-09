import { NextRequest, NextResponse } from "next/server";
import { getDatabase, Collections } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const brandsCollection = db.collection(Collections.BRANDS);
    
    // Get all brands
    const allBrands = await brandsCollection.find({}).toArray();
    
    return NextResponse.json({
      brands: allBrands,
      brandCount: allBrands.length
    });
  } catch (error) {
    console.error("Error in debug brands:", error);
    return NextResponse.json(
      { message: "Failed to fetch debug data", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
