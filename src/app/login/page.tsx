"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { useSignIn } from "@/lib/db/services/user/requests";
import { loginSchema, type LoginFormData } from "@/utils/schemas";

const AuthPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: signInMutate } = useSignIn();
  const defaultValues = {
    email: "",
    password: "",
  };
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError("");
      setIsLoading(true);

      // Step 1: Verify credentials via server action (Prisma + bcrypt)
      try {
        await signInMutate(data);
      } catch (err: any) {
        setAuthError(err?.message || "Invalid email or password");
        return;
      }

      // Step 2: Create the NextAuth session on the client
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setAuthError("Invalid email or password");
      } else {
        const callbackUrl = searchParams?.get("callbackUrl") || "/";
        reset(defaultValues);
        router.refresh();
        router.replace(callbackUrl);
      }
    } catch (error: any) {
      console.log("error ==> ", error);
      setAuthError(error?.message ?? "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBottomPanel = () => (
    <div
      style={{
        background:
          "linear-gradient(121.88deg, #AF1E2E 23.85%, #490D13 122.09%)",
      }}
      className="w-full h-[180px] bg-primary flex-row relative overflow-hidden rounded-t-[16px] flex"
    >
      <div className="text-left flex flex-col justify-center text-white px-10">
        <p className="text-lg">BAK HR Module</p>
        <p className="text-xs font-light mt-2">
          Welcome to BAK United. Since 2008, we have been a trusted name in
          construction across Saudi Arabia. We are dedicated to delivering
          excellence in every project, from residential developments to
          industrial complexes, driven by integrity and quality craftsmanship.
        </p>
      </div>
      {/* Center Placeholder - Geometric Pattern */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="relative w-[90%] h-[90%]">
          <div
            className="absolute -right-10 -top-[15px] w-[263px] h-[263px] border-60 border-solid border-[#FAE7E908]"
            style={{
              transform: "rotate(45deg)",
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderLeftPanel = () => (
    <div
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F4F7FB 110.36%)",
      }}
      className="w-full lg:w-[35%] min-w-full lg:min-w-[500px] h-full rounded-tr-[36px] rounded-br-[36px] flex flex-col justify-center z-30"
    >
      <div className="px-5 lg:px-10 flex items-center flex-1 py-5 w-full lg:w-[90%] xl:w-[80%] self-center max-w-[450px]">
        <div className="text-center w-full lg:text-left">
          <Image
            priority
            width={95}
            height={60}
            alt="BAK Logo"
            className="mb-6 object-contain mx-auto lg:mx-0"
            src="/assets/images/bak_transparent_logo.png"
          />
          <p className="text-[26px] font-semibold text-primary">HR MODULE</p>
          <p className="text-2xl font-semibold mt-1">Sign In</p>

          <form className="space-y-6 mt-6">
            <div className="space-y-1 text-left">
              <label
                htmlFor="email"
                className="block text-sm text-gray-600 ml-0.5"
              >
                Email
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="email"
                    {...field}
                    disabled={isLoading}
                    className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-1 transition-colors ${
                      errors.email ? "p-invalid" : ""
                    }`}
                    placeholder="username@domain.com"
                  />
                )}
              />
              {errors.email && (
                <small className="text-red-500 text-xs block mt-2 ml-1">
                  {errors.email.message}
                </small>
              )}
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="password"
                className="block text-sm text-gray-600 ml-0.5"
              >
                Password
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Password
                    id="password"
                    {...field}
                    toggleMask
                    feedback={false}
                    disabled={isLoading}
                    className="w-full"
                    inputClassName={`w-full p-3 border border-gray-300 rounded-xl focus:ring-1 transition-colors ${
                      errors.password ? "p-invalid" : ""
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        e?.preventDefault?.();
                        handleSubmit(onSubmit)();
                      }
                    }}
                    placeholder="xxxxxxxx"
                  />
                )}
              />
              {errors.password && (
                <small className="text-red-500 text-xs block mt-0 ml-1">
                  {errors.password.message}
                </small>
              )}
            </div>

            {authError && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                {authError}
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              loading={isLoading}
              style={{ borderRadius: "12px" }}
              label={isLoading ? "Signing..." : "Sign In"}
              onClick={handleSubmit(onSubmit)}
            />
          </form>
        </div>
      </div>
      <div className="block lg:hidden">{renderBottomPanel()}</div>
    </div>
  );

  return (
    <div className="w-full h-screen">
      <div
        style={{
          background:
            "linear-gradient(121.88deg, #AF1E2E 23.85%, #490D13 122.09%)",
        }}
        className="w-full h-full flex-row relative overflow-hidden hidden lg:flex"
      >
        <div className="absolute z-20 bottom-7 right-7">
          <img
            src={"/assets/images/bak-logo-white-text.png"}
            className="h-[12vh] w-[12vh] object-contain"
          />
        </div>

        {renderLeftPanel()}
        <div className="w-[65%] h-full flex flex-col items-center justify-center">
          <div className="max-w-[600px] text-left text-white px-10">
            <p className="text-4xl font-semibold">
              Welcome to
              <br />
              BAK HR Module
            </p>
            <p className="text-sm mt-2">
              Welcome to BAK United. Since 2008, we have been a trusted name in
              construction across Saudi Arabia. We are dedicated to delivering
              excellence in every project, from residential developments to
              industrial complexes, driven by integrity and quality
              craftsmanship.
            </p>
          </div>
        </div>
        {/* Center Placeholder - Geometric Pattern */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="relative w-[80vw] h-[80vw]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="absolute border-[#FAE7E90F]"
                style={{
                  width: "110vh",
                  height: "110vh",
                  transform: "rotate(45deg)",
                  borderWidth: "120px",
                  borderStyle: "solid",
                }}
              />
              <div
                className="absolute border-[#FAE7E908]"
                style={{
                  width: "60vh",
                  height: "60vh",
                  transform: "rotate(45deg)",
                  borderWidth: "120px",
                  borderStyle: "solid",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex lg:hidden w-full h-full">{renderLeftPanel()}</div>
    </div>
  );
};

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  );
}
