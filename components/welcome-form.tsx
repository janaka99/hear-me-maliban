"use client";

import { WelcomeFormSchema, WelcomeFormSchemaType } from "@/schema/file-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { useUser } from "@/context/user";

function WelcomeForm() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const { isloading, setUser } = useUser();

  const form = useForm<WelcomeFormSchemaType>({
    resolver: zodResolver(WelcomeFormSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const submit = async (values: WelcomeFormSchemaType) => {
    if (isloading) {
      return;
    }

    await setUser({
      ...values,
    });
  };

  return (
    <div className="p-6 w-full">
      {/* Glassmorphism container */}
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-6 w-full relative z-10"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    className="bg-white/5 border-white/20 backdrop-blur-sm text-black placeholder:text-black/40 focus:bg-white/10 focus:border-white/40 transition-all duration-300 rounded-xl h-12"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium">
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your phone number"
                    {...field}
                    className="bg-white/5 border-white/20 backdrop-blur-sm text-black placeholder:text-black/40 focus:bg-white/10 focus:border-white/40 transition-all duration-300 rounded-xl h-12"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-600 font-medium">
                  Date of Birth
                </FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between font-normal bg-white/5 border-white/20 backdrop-blur-sm text-gray-600  hover:bg-white/10 hover:border-white/40 transition-all duration-300 rounded-xl h-12"
                    >
                      {field.value
                        ? new Date(field.value).toLocaleDateString()
                        : "Select date"}
                      <ChevronDownIcon className="text-gray-600 " />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      captionLayout="dropdown"
                      onSelect={(selectedDate) => {
                        if (!selectedDate) return;

                        // Convert Date to ISO string before updating RHF
                        const dateStr = selectedDate.toISOString();

                        setDate(selectedDate); // optional local state
                        field.onChange(dateStr); // update RHF value with string
                        setOpen(false);
                      }}
                      className="text-gray-600"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="w-full flex justify-center pt-2">
            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500 hover:to-pink-500 text-white font-semibold h-12 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Starting..." : "Start"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default WelcomeForm;
