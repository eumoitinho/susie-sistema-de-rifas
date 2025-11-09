import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/server/auth';

const BACKEND_BASE_URL = process.env.BACKEND_API_URL ?? 'http://localhost:4000';
const BACKEND_API_PREFIX = process.env.BACKEND_API_PREFIX ?? '/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const fotos = formData.getAll('fotos') as File[];
    const videos = formData.getAll('videos') as File[];

    if (fotos.length === 0 && videos.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    if (fotos.length > 10) {
      return NextResponse.json({ error: 'Máximo de 10 fotos' }, { status: 400 });
    }

    if (videos.length > 2) {
      return NextResponse.json({ error: 'Máximo de 2 vídeos' }, { status: 400 });
    }

    const backendFormData = new FormData();
    fotos.forEach((foto) => {
      backendFormData.append('fotos', foto);
    });
    videos.forEach((video) => {
      backendFormData.append('videos', video);
    });

    const response = await fetch(`${BACKEND_BASE_URL}${BACKEND_API_PREFIX}/upload/rifa/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro ao fazer upload' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erro inesperado ao fazer upload' },
      { status: 500 }
    );
  }
}

