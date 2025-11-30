"use client";

import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { loginSchema, type LoginFormData } from "@/utils/schemas";

const AuthPage = () => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // TODO: Add login API call here
      console.log("Login data:", data);
      router.replace("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="bg-white w-full h-screen flex flex-row overflow-hidden">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center items-center relative overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Image
              priority
              width={150}
              height={60}
              alt="BAK Logo"
              className="mx-auto mb-6 object-contain"
              src="/assets/images/bak_transparent_logo.png"
            />
            <h1 className="text-3xl font-normal hidden lg:block text-gray-800">
              SIGN IN
            </h1>
            <h1 className="text-3xl font-normal block lg:hidden text-gray-800">
              BAK TIMESHEET
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-sm text-gray-500 text-center mb-6">
              By entering your email address and password, you get access to the
              system.
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm text-gray-600 ml-0.5"
              >
                Email
              </label>
              <InputText
                id="email"
                {...register("email")}
                className={`w-full p-3 border border-gray-300 rounded-md focus:ring-1 transition-colors ${
                  errors.email ? "p-invalid" : ""
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <small className="text-red-500 text-xs block mt-2 ml-1">
                  {errors.email.message}
                </small>
              )}
            </div>

            <div className="space-y-2">
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
                    className="w-full"
                    inputClassName={`w-full p-3 border border-gray-300 rounded-md focus:ring-1 transition-colors ${
                      errors.password ? "p-invalid" : ""
                    }`}
                    placeholder="Enter your password"
                  />
                )}
              />
              {errors.password && (
                <small className="text-red-500 text-xs block mt-0 ml-1">
                  {errors.password.message}
                </small>
              )}
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              label={isSubmitting ? "Signing in..." : "Sign in"}
              style={{ borderRadius: "100px" }}
              className="w-full"
            />
          </form>
        </div>
      </div>

      {/* Right Panel - Info */}
      <div className="hidden lg:flex lg:w-2/5 bg-secondary-white p-8 lg:p-12 flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-md text-left">
          <div className="relative w-full">
            <div className="w-auto h-auto rounded-lg">
              <Image
                priority
                width={400}
                height={300}
                alt="Login Illustration"
                src="/assets/images/login-illustration.svg"
              />
            </div>
          </div>

          <h2 className="text-2xl font-normal text-gray-800 mt-8 mb-4">
            BAK Timesheet - Human Resources System
          </h2>

          <p className="text-gray-500 text-sm mb-4 leading-relaxed">
            Welcome to BAK United. Since 2008, we have been a trusted name in
            construction across Saudi Arabia. We are dedicated to delivering
            excellence in every project, from residential developments to
            industrial complexes, driven by integrity and quality craftsmanship.
          </p>

          <ul className="text-left text-sm text-gray-600 space-y-3 inline-block">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              Comprehensive Construction Services
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              Residential & Commercial Projects
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              Quality Craftsmanship
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
              Client-Centric Approach
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
