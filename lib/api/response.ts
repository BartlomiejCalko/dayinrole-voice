export const apiSuccess = (data: unknown, init?: { status?: number }) => {
  return Response.json(
    typeof data === 'object' && data !== null && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : { data },
    { status: init?.status ?? 200 }
  );
};

export const apiError = (
  message: string,
  status: number = 400,
  extras?: Record<string, unknown>
) => {
  return Response.json(
    { success: false, message, ...(extras || {}) },
    { status }
  );
}; 