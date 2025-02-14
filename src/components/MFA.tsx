
import React, { useState, useEffect } from "react";
import OTPAuth from "otpauth";
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const MFA = () => {
    const [secret, setSecret] = useState("");
    const [otpURL, setOtpURL] = useState("");
    const [token, setToken] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        try {
            if (!OTPAuth) {
                throw new Error("Required packages not found. Make sure to install: otpauth");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    }, []);

    const generateSecret = () => {
        try {
            const totp = new OTPAuth.TOTP({
                issuer: "YourApp",
                label: "user@example.com",
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.generate(),
            });

            setSecret(totp.secret.base32);
            setOtpURL(totp.toString());
            setError(null);
        } catch (err) {
            setError("Error generating secret: " + (err instanceof Error ? err.message : "An error occurred"));
        }
    };

    const verifyOTP = () => {
        try {
            const totp = new OTPAuth.TOTP({ secret });
            const isValid = totp.validate({ token });

            setIsVerified(isValid !== null);
            
            if (isValid !== null) {
                toast({
                    title: "Success",
                    description: "OTP verified successfully!",
                    variant: "default",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Invalid OTP",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to verify OTP",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">Multi-Factor Authentication (MFA)</h2>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
            )}

            {!error && (
                <>
                    {secret ? (
                        <div className="space-y-6">
                            <p className="text-gray-600">Scan this QR code in Google Authenticator:</p>
                            <div className="bg-gray-100 p-8 rounded-lg inline-block">
                                <QRCodeSVG value={otpURL} size={200} />
                            </div>
                            <div>
                                <p className="text-gray-600 mb-2">Or enter this key manually:</p>
                                <code className="bg-gray-100 px-4 py-2 rounded text-sm break-all">
                                    {secret}
                                </code>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="max-w-xs"
                                />
                                <Button onClick={verifyOTP}>
                                    Verify OTP
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button onClick={generateSecret}>
                            Generate MFA Secret
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

export default MFA;
