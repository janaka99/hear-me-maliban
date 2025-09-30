interface VideoMetadata {
  id: string;
  totalChunks: number;
  mimeType: string;
  duration: number;
  createdAt: number;
}

class VideoStorageManager {
  async saveChunk(
    videoId: string,
    chunkIndex: number,
    data: Blob,
    mimeType: string
  ): Promise<void> {
    const formData = new FormData();
    formData.append("videoId", videoId);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("chunk", data);
    formData.append("mimeType", mimeType);

    const response = await fetch("/api/video/upload-chunk", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk: ${response.statusText}`);
    }

    console.log(
      `[v0] Successfully uploaded chunk ${chunkIndex} for video ${videoId}`
    );
  }

  async saveMetadata(metadata: VideoMetadata): Promise<void> {
    const response = await fetch("/api/video/save-metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`Failed to save metadata: ${response.statusText}`);
    }

    console.log(`[v0] Successfully saved metadata for video ${metadata.id}`);
  }

  async getVideoBlob(videoId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`/api/video/get-video?videoId=${videoId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to retrieve video: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log(`[v0] Successfully retrieved video ${videoId}`);
      return blob;
    } catch (error) {
      console.error("[v0] Error retrieving video:", error);
      return null;
    }
  }

  async deleteVideo(videoId: string): Promise<void> {
    const response = await fetch(`/api/video/delete-video?videoId=${videoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.statusText}`);
    }

    console.log(`[v0] Successfully deleted video ${videoId}`);
  }

  async listVideos(): Promise<VideoMetadata[]> {
    // Note: List functionality would require additional API endpoint
    console.log("[v0] List videos - not implemented yet");
    return [];
  }
}

export const videoStorage = new VideoStorageManager();
