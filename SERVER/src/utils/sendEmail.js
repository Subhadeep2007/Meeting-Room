import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(
    process.env.RESEND_API_KEY
);

export const sendEmail = async(
    to,
    subject,
    html
) => {

    const result = await resend.emails.send({

        from: process.env.EMAIL_FROM,

        to,

        subject,

        html,

    });

    if (result.error) {

        console.error(
            "❌ Resend Email Error:",
            result.error
        );

        throw new Error(
            result.error.message ||
            "Failed to send email"
        );

    }

    console.log(
        "✅ Email Sent Successfully"
    );

    return result.data;

};