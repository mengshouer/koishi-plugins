import { Context, h, Schema } from "koishi";

export const name = "url-sender";

export interface Config {
  maxFileSize: number;
  timeout: number;
  allowedHosts: string[];
  supportedImageTypes: string[];
  supportedVideoTypes: string[];
  supportedImageExtensions: string[];
  supportedVideoExtensions: string[];
}

export const Config: Schema<Config> = Schema.object({
  maxFileSize: Schema.number()
    .default(50 * 1024 * 1024)
    .description("Maximum file size in bytes (default: 50MB)"),
  timeout: Schema.number()
    .default(10000)
    .description("Request timeout in milliseconds (default: 10s)"),
  allowedHosts: Schema.array(String)
    .default([])
    .description("Allowed host domains (empty = allow all)"),
  supportedImageTypes: Schema.array(String)
    .default([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/svg+xml",
    ])
    .description("Supported image MIME types"),
  supportedVideoTypes: Schema.array(String)
    .default([
      "video/mp4",
      "video/avi",
      "video/mkv",
      "video/webm",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/3gp",
    ])
    .description("Supported video MIME types"),
  supportedImageExtensions: Schema.array(String)
    .default([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"])
    .description("Supported image file extensions"),
  supportedVideoExtensions: Schema.array(String)
    .default([".mp4", ".avi", ".mkv", ".webm", ".mov", ".wmv", ".flv", ".3gp"])
    .description("Supported video file extensions"),
});

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

function isHostAllowed(url: string, allowedHosts: string[]): boolean {
  if (allowedHosts.length === 0) return true;

  try {
    const urlObj = new URL(url);
    return allowedHosts.some((host) => urlObj.hostname.includes(host));
  } catch {
    return false;
  }
}

function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const lastDotIndex = pathname.lastIndexOf(".");
    return lastDotIndex !== -1 ? pathname.substring(lastDotIndex) : "";
  } catch {
    return "";
  }
}

function detectContentTypeByExtension(
  url: string,
  config: Config
): "image" | "video" | "unknown" {
  const extension = getFileExtension(url);

  if (config.supportedImageExtensions.includes(extension)) {
    return "image";
  }

  if (config.supportedVideoExtensions.includes(extension)) {
    return "video";
  }

  return "unknown";
}

function detectContentTypeByMimeType(
  contentType: string,
  config: Config
): "image" | "video" | "unknown" {
  const mimeType = contentType.toLowerCase().split(";")[0].trim();

  if (config.supportedImageTypes.includes(mimeType)) {
    return "image";
  }

  if (config.supportedVideoTypes.includes(mimeType)) {
    return "video";
  }

  return "unknown";
}

async function detectContentType(
  ctx: Context,
  url: string,
  timeout: number,
  config: Config
): Promise<"image" | "video" | "unknown"> {
  try {
    // Use Koishi's HTTP client to make HEAD request
    // This will respect global proxy and timeout settings
    const response = await ctx.http("HEAD", url, {
      timeout,
      responseType: "stream", // Don't download the actual content
    });

    // Try to get content-type from response headers
    let contentType: string | undefined;

    // Check if response has headers property
    if (response && typeof response === "object" && "headers" in response) {
      const headers = (response as any).headers;
      if (headers && typeof headers.get === "function") {
        contentType = headers.get("content-type");
      } else if (headers && typeof headers === "object") {
        contentType = headers["content-type"] || headers["Content-Type"];
      }
    }

    if (contentType) {
      const typeByMime = detectContentTypeByMimeType(contentType, config);
      if (typeByMime !== "unknown") {
        return typeByMime;
      }
    }

    // Fallback to file extension detection
    return detectContentTypeByExtension(url, config);
  } catch (error) {
    // If HEAD request fails, fallback to extension detection
    return detectContentTypeByExtension(url, config);
  }
}

export function apply(ctx: Context, config: Config) {
  ctx
    .command("botcmd-send <url>", "Send image or video from URL")
    .example("botcmd-send https://example.com/image.jpg")
    .action(async (_, url) => {
      if (!url) {
        return "Please provide a URL. Usage: /botcmd-send <url>";
      }

      // Validate URL format
      if (!isValidUrl(url)) {
        return "Invalid URL format. Please provide a valid HTTP/HTTPS URL.";
      }

      // Check allowed hosts
      if (!isHostAllowed(url, config.allowedHosts)) {
        return "This host is not allowed.";
      }

      try {
        // Detect content type
        const contentType = await detectContentType(
          ctx,
          url,
          config.timeout,
          config
        );

        if (contentType === "unknown") {
          return "Unsupported content type. Only images and videos are supported.";
        }

        // Send appropriate content
        if (contentType === "image") {
          return h.image(url);
        } else if (contentType === "video") {
          return h.video(url);
        }
      } catch (error) {
        ctx.logger.error("Failed to process URL:", error);
        return "Failed to process the URL. Please check if the URL is accessible and try again.";
      }
    });
}
