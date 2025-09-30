"use server";
import { prisma } from "@/lib/prisma";
import {
  VideoUploadSchema,
  VideoUploadSchemaType,
} from "./../schema/file-schema";
import { WelcomeFormSchema, WelcomeFormSchemaType } from "@/schema/file-schema";
import { query } from "@/lib/db";

export const uploadVideo = async (
  userdata: WelcomeFormSchemaType | any,
  url: string
) => {
  try {
    const { success, data, error } = WelcomeFormSchema.safeParse(userdata);
    console.log(userdata);
    if (!success || !url) {
      console.log(error);
      return {
        error: "Server error occured try again " + error,
      };
    }

    await query(
      `INSERT INTO "WelcomeForm" (name, phone, dob, url, "updatedAt", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.name, data.phone, data.dob, userdata.url, new Date(), new Date()]
    );

    return {
      success: true,
      videoUrl: "Successfully submitted",
    };
  } catch (error) {
    return {
      error: error,
    };
  }
};

export const videoUploadAction = async (
  userdata: VideoUploadSchemaType | any
) => {
  try {
    const { success, data, error } = VideoUploadSchema.safeParse(userdata);
    if (!success) {
      console.log(error);
      return {
        error: "Server error occured try again",
      };
    }

    await query(
      `INSERT INTO "WelcomeForm" (name, phone, dob, url, "updatedAt", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.name, data.phone, data.dob, userdata.url, new Date(), new Date()]
    );

    return {
      success: true,
      videoUrl: "Successfully submitted",
    };
  } catch (error) {
    console.log(error);
    return {
      error: error,
    };
  }
};
