import { db } from '@/firebase/admin';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('API: Fetching day-in-roles for userId:', userId);

    if (!userId) {
      console.log('API: No userId provided');
      return Response.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    // First, try the exact userId
    console.log('API: Querying dayinroles collection with exact userId...');
    let querySnapshot = await db
      .collection("dayinroles")
      .where("userId", "==", userId)
      .get();

    console.log('API: Query with exact userId completed, found', querySnapshot.size, 'documents');

    // If no results and the userId contains 'I', try with 'l' (common case sensitivity issue)
    if (querySnapshot.size === 0 && userId.includes('I')) {
      const alternativeUserId = userId.replace(/I/g, 'l');
      console.log('API: Trying alternative userId:', alternativeUserId);
      
      querySnapshot = await db
        .collection("dayinroles")
        .where("userId", "==", alternativeUserId)
        .get();
      
      console.log('API: Query with alternative userId completed, found', querySnapshot.size, 'documents');
    }

    // If still no results and the userId contains 'l', try with 'I'
    if (querySnapshot.size === 0 && userId.includes('l')) {
      const alternativeUserId = userId.replace(/l/g, 'I');
      console.log('API: Trying alternative userId:', alternativeUserId);
      
      querySnapshot = await db
        .collection("dayinroles")
        .where("userId", "==", alternativeUserId)
        .get();
      
      console.log('API: Query with alternative userId completed, found', querySnapshot.size, 'documents');
    }

    const dayInRoles: DayInRole[] = [];
    querySnapshot.forEach((doc) => {
      console.log('API: Processing document:', doc.id);
      dayInRoles.push({
        id: doc.id,
        ...doc.data()
      } as DayInRole);
    });

    // Sort by createdAt in JavaScript instead of Firestore
    dayInRoles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('API: Returning', dayInRoles.length, 'day-in-roles');
    return Response.json({ 
      success: true, 
      data: dayInRoles 
    }, { status: 200 });

  } catch (error) {
    console.error('API Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return Response.json({ 
      success: false, 
      message: `Failed to fetch day in roles: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 