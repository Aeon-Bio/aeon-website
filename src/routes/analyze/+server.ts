// import { json } from '@sveltejs/kit';
// import type { RequestHandler } from './$types';
// import { AZURE_FUNCTION_URL } from '$env/static/private';

// export const POST: RequestHandler = async ({ request }) => {
//     try {
//         const formData = await request.formData();
//         const file = formData.get('file') as File;
//         const cpgColumn = formData.get('cpgColumn') as string;
//         const sampleColumn = formData.get('sampleColumn') as string;

//         if (!file || !cpgColumn || !sampleColumn) {
//             return json({ error: 'Missing required fields' }, { status: 400 });
//         }

//         // Initial upload to Azure Function
//         const uploadResponse = await fetch(`${AZURE_FUNCTION_URL}/api/methylation-analysis?` + new URLSearchParams({
//             sample_id: sampleColumn,
//             probe_id_col: cpgColumn
//         }), {
//             method: 'POST',
//             body: await file.arrayBuffer()
//         });

//         if (!uploadResponse.ok) {
//             throw new Error('Upload failed: ' + await uploadResponse.text());
//         }

//         const { statusQueryGetUri } = await uploadResponse.json();
        
//         return json({ statusUrl: statusQueryGetUri });

//     } catch (error) {
//         console.error('Server error:', error);
//         return json({ error: 'Server error occurred' }, { status: 500 });
//     }
// }; 