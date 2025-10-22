import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

// Создаем директории если их нет
const ensureDirExists = async (path: string) => {
  try {
    await mkdir(path, { recursive: true });
  } catch {
    // Директория уже существует
  }
};

// Функция для генерации уникального имени файла
const generateFileName = (originalName: string, extension: string) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  return `${baseName}_${timestamp}_${random}.${extension}`;
};

// Функция для оптимизации изображения
const optimizeImage = async (buffer: Buffer, fileName: string) => {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Определяем размеры для разных вариантов
    const sizes = [
      { suffix: '_thumb', width: 150, height: 150 },
      { suffix: '_small', width: 400, height: 400 },
      { suffix: '_medium', width: 800, height: 800 },
      { suffix: '_large', width: 1200, height: 1200 },
    ];

    const results = [];
    const baseName = fileName.replace(/\.[^/.]+$/, '');

    // Создаем разные размеры
    for (const size of sizes) {
      const resized = await image
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      const newFileName = `${baseName}${size.suffix}.webp`;
      const filePath = join(process.cwd(), 'public', 'images', 'products', newFileName);
      
      await writeFile(filePath, resized);
      results.push({
        size: size.suffix.replace('_', ''),
        fileName: newFileName,
        url: `/images/products/${newFileName}`,
        width: size.width,
        height: size.height,
      });
    }

    // Создаем оригинальный WebP
    const originalWebp = await image
      .webp({ quality: 90 })
      .toBuffer();

    const originalFileName = `${baseName}_original.webp`;
    const originalPath = join(process.cwd(), 'public', 'images', 'products', originalFileName);
    
    await writeFile(originalPath, originalWebp);
    
    results.push({
      size: 'original',
      fileName: originalFileName,
      url: `/images/products/${originalFileName}`,
      width: metadata.width,
      height: metadata.height,
    });

    return results;
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Ошибка при обработке изображения');
  }
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    console.log('🔍 Upload request:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type 
    });
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Неподдерживаемый тип файла' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'Файл слишком большой (максимум 50MB)' },
        { status: 400 }
      );
    }

    // Создаем директории
    await ensureDirExists(join(process.cwd(), 'public', 'images', 'products'));

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const extension = file.type.startsWith('video/') ? 'mp4' : 'webp';

    // Если это видео, сохраняем как есть
    if (file.type.startsWith('video/')) {
      const fileName = generateFileName(originalName, extension);
      const filePath = join(process.cwd(), 'public', 'images', 'products', fileName);
      
      await writeFile(filePath, buffer);
      
      return NextResponse.json({
        success: true,
        data: {
          fileName,
          url: `/images/products/${fileName}`,
          type: 'video',
          size: file.size,
          originalName,
        }
      });
    }

    // Обрабатываем изображение
    const optimizedImages = await optimizeImage(buffer, generateFileName(originalName, 'webp'));

    console.log('🔍 Upload successful:', {
      imagesCount: optimizedImages.length,
      originalName,
      type: 'image'
    });

    return NextResponse.json({
      success: true,
      data: {
        images: optimizedImages,
        originalName,
        type: 'image',
        size: file.size,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}

// Удаление изображения
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');
    
    if (!fileName) {
      return NextResponse.json(
        { success: false, message: 'Имя файла не указано' },
        { status: 400 }
      );
    }

    const { unlink } = await import('fs/promises');
    const filePath = join(process.cwd(), 'public', 'images', 'products', fileName);
    
    try {
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Файл не найден' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении файла' },
      { status: 500 }
    );
  }
}
