import { NextRequest } from 'next/server';
import { SAMPLE_DAY_IN_ROLES } from '@/constants/sample-data';

export async function GET(request: NextRequest) {
  try {
    // Return sample data for Free plan users
    const transformedData = SAMPLE_DAY_IN_ROLES.map(role => ({
      id: role.id,
      userId: role.userId,
      companyName: role.companyName,
      companyLogo: role.companyLogo,
      position: role.position,
      description: role.description,
      challenges: role.challenges,
      requirements: role.requirements,
      techstack: role.techstack,
      coverImage: role.coverImage,
      language: role.language,
      createdAt: role.createdAt,
      isSample: true // Mark as sample data
    }));

    return Response.json({ 
      success: true, 
      data: transformedData 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching sample data:', error);
    return Response.json({ 
      success: false, 
      message: `Failed to fetch sample data: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 