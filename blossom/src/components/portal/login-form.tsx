'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signup, login } from '@/actions/auth'
import { object, string } from 'yup';
import { useRouter } from "next/navigation"


// Add styles for error animations
const errorInputClass = "border-red-500 animate-shake focus:border-red-500 transition-colors";
const errorMessageClass = "text-sm text-red-500 animate-fadeIn";
const successMessageClass = "text-sm text-green-600 animate-fadeIn";


export const loginSchema = object({
  username: string().required("Username is required").min(4, "Username must be at least 4 characters").max(14, "Username must be at most 14 characters"),
  password: string().required("Password is required").min(8, "Password must be at least 8 characters"),
})

export const registerSchema = object({
  username: string().required("Username is required").min(4, "Username must be at least 4 characters").max(14, "Username must be at most 14 characters"),
  password: string().required("Password is required").min(8, "Password must be at least 8 characters"),
  accessCode: string().required("Access code is required")
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateForm = async () => {
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      setIsValid(true);
      // Only clear errors if form is valid
      setErrors({});
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach((err) => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
      setIsValid(false);
    }
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear server error when user starts typing
    if (serverError) setServerError("");
    // Mark field as touched when user starts typing
    if (success) setSuccess(false);
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setServerError("");
    setSuccess(false);
    
    // Mark all fields as touched on submit attempt
    setTouched({ username: true, password: true });
    
    try {
      await loginSchema.validate({
        username: formData.get("username"),
        password: formData.get("password")
      }, { abortEarly: false });
      setErrors({});
      
      const result = await login(formData);
      if (result) {
        // If result is returned, it's an error message
        setServerError(result);
      }
      else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000)

      }
      // If no result, redirect should have happened
    } catch (error) {
      if (error.inner) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else if (error.message != 'NEXT_REDIRECT') {
        console.log("Unexpected error:", error);
        setServerError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowError = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your username and password below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="flex flex-col gap-6">
              {serverError && (
                <div className={cn("p-3 rounded-md bg-red-50 border border-red-200", errorMessageClass)}>
                  {serverError}
                </div>
              )}
              {
                success && (
                  <div className={cn("p-3 rounded-md bg-green-50 border border-green-200", successMessageClass)}>
                    Successfully logged in! Redirecting...
                  </div>
                )
              }
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="username"
                  name="username"
                  placeholder="absceptual"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    shouldShowError("username") && errorInputClass
                  )}
                />
                {shouldShowError("username") && (
                  <span className={errorMessageClass}>{errors.username}</span>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] min-w-[450px]">
                      <DialogHeader>
                        <DialogTitle>Password resets are currently unavailable</DialogTitle>
                        <DialogDescription>
                          Please contact the administrator to manually reset your account.
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    shouldShowError("password") && errorInputClass
                  )}
                />
                {shouldShowError("password") && (
                  <span className={errorMessageClass}>{errors.password}</span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?
              <Link href={{ pathname: "/portal", query: { register: true } }} className="ml-1 underline underline-offset-4">
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({ username: "", password: "", accessCode: "" });
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateForm = async () => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setIsValid(true);
      // Only clear errors if form is valid
      setErrors({});
    } catch (error) {
      const validationErrors = {};
      error.inner.forEach((err) => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
      setIsValid(false);
    }
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear server error when user starts typing
    if (serverError) setServerError("");

    if ( success ) setSuccess(false);
    // Mark field as touched when user starts typing
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setServerError("");
    
    // Mark all fields as touched on submit attempt
    setTouched({ username: true, password: true, accessCode: true });
    
    try {
      await registerSchema.validate({
        username: formData.get("username"),
        password: formData.get("password"),
        accessCode: formData.get("accessCode")
      }, { abortEarly: false });
      setErrors({});
      
      const result = await signup(formData);
      if (result) {
        // If result is returned, it's an error message
        setServerError(result);
      }
      else {
        setSuccess(true);
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000)
      }
      // If no result, redirect should have happened
    } catch (error) {
      if (error.inner) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setServerError("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowError = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
          <CardDescription>
            Only authorized users can create an account. Please contact the
            administrator if you need an access code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="flex flex-col gap-6">
              {serverError && (
                <div className={cn("p-3 rounded-md bg-red-50 border border-red-200", errorMessageClass)}>
                  {serverError}
                </div>
              )}
              {success && (
                <div className={cn("p-3 rounded-md bg-green-50 border border-green-200", successMessageClass)}>
                  Account created successfully! Redirecting to dashboard...
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="username"
                  placeholder="absceptual"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    shouldShowError("username") && errorInputClass
                  )}
                />
                {shouldShowError("username") && (
                  <span className={errorMessageClass}>{errors.username}</span>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    shouldShowError("password") && errorInputClass
                  )}
                />
                {shouldShowError("password") && (
                  <span className={errorMessageClass}>{errors.password}</span>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="accessCode">Access Code</Label>
                </div>
                <Input 
                  id="accessCode" 
                  name="accessCode" 
                  type="text" 
                  required 
                  value={formData.accessCode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    shouldShowError("accessCode") && errorInputClass
                  )}
                />
                {shouldShowError("accessCode") && (
                  <span className={errorMessageClass}>{errors.accessCode}</span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Register"}
                </Button>
              </div>
              <Separator orientation="horizontal"/>
            </div>
            <div className="mt-4 text-center text-sm">
              Existing user?
              <Link href={{ pathname: "/portal", query: { register: false } }} className="ml-1 underline underline-offset-4">
                Login here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}