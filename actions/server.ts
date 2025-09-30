"use server";

import prisma from "@/lib/prisma";
import { WelcomeFormSchema, WelcomeFormSchemaType } from "@/schema/file-schema";

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
        error: "Server error occured try gain",
      };
    }

    const res = await prisma.welcomeForm.create({
      data: {
        name: data.name,
        phone: data.phone,
        dob: data.dob,
        url: url,
      },
    });

    return {
      success: true,
      videoUrl: "Successfully submitted",
    };
  } catch (error) {
    return {
      error: "Server error occured try gain",
    };
  }
};
