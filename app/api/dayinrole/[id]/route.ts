import { db } from '@/firebase/admin';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    // Fetch the day-in-role document
    const docRef = db.collection("dayinroles").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ success: false, message: "Day in role not found" }, { status: 404 });
    }

    const data = doc.data();
    
    // Verify the user owns this day-in-role
    if (data?.userId !== userId) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    return Response.json({ 
      success: true, 
      data: { 
        id: doc.id, 
        ...data 
      } 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching day in role:', error);
    return Response.json({ success: false, message: "Failed to fetch day in role" }, { status: 500 });
  }
} 