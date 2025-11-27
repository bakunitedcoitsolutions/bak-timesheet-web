"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { loginSchema, type LoginFormData } from "@/utils/schemas";

const AuthPage = () => {
  const router = useRouter();
  const {
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
    <div
      className="login-page-container"
      style={{
        backgroundImage: "url('/assets/images/login-bg.jpg')",
      }}
    >
      <div className="login-background-overlay"></div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 shadow-lg w-full max-w-[450px] flex flex-col items-center relative z-10"
      >
        <div className="flex justify-center mb-3">
          <Image
            priority
            width={80}
            height={80}
            alt="BAK Logo"
            className="mx-auto"
            src="/assets/images/bak_transparent_logo.png"
          />
        </div>

        <div className="text-center">
          <h1 className="font-extrabold text-lg md:text-xl text-gray-800 m-0">
            BAK UNITED CO.
          </h1>
        </div>

        <div className="text-center mt-5 mb-5">
          <h2 className="text-base md:text-lg font-bold text-gray-800 m-0 mb-2">
            WELCOME TO BAK TIMESHEET
          </h2>
          <p className="text-gray-500 text-sm m-0">
            Enter your email and password to access your dashboard and manage
            your timesheet efficiently
          </p>
        </div>

        <div className="mb-4 w-full">
          <label
            htmlFor="email"
            className="block text-gray-800 font-medium mb-2 text-sm"
          >
            Email
          </label>
          <InputText
            id="email"
            {...register("email")}
            invalid={!!errors.email?.message}
            className={`w-full`}
            placeholder="Enter Your Email"
            style={{
              padding: "0.875rem",
              fontSize: "0.875rem",
              borderRadius: "0",
            }}
          />
          {!!errors.email?.message && (
            <small className="text-red-500 text-xs mt-1.5 block">
              {errors.email.message}
            </small>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-5 w-full">
          <label
            htmlFor="password"
            className="block text-gray-800 font-medium mb-2 text-sm"
          >
            Password
          </label>
          <div className="w-full">
            <Password
              id="password"
              {...register("password")}
              placeholder="Enter Your Password"
              className={`w-full`}
              inputClassName="w-full"
              toggleMask
              invalid={!!errors.password?.message}
              feedback={false}
              inputStyle={{
                padding: "0.875rem",
                fontSize: "0.875rem",
                width: "100%",
                borderRadius: "0",
              }}
              style={{
                width: "100%",
              }}
            />
          </div>
          {!!errors.password?.message && (
            <small className="text-red-500 text-xs mt-1.5 block">
              {errors.password.message}
            </small>
          )}
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          label={isSubmitting ? "Logging in..." : "Login"}
          className="w-full"
          disabled={isSubmitting}
          style={{ borderRadius: "0" }}
        />
      </form>
    </div>
  );
};

export default AuthPage;
