export class ProjectDocumentDto {
  id: number;
  projectId: number;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: number;
}

export class UploadDocumentDto {
  projectId: number;
}
