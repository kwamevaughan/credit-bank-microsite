import Image from "next/image";
import Link from "next/link";

const Footer = ({ mode }) => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="bg-[#212529] px-6 sm:px-10 md:px-20 pt-8 pb-28">

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 pt-10 gap-2">
                <div className="flex flex-col justify-center pb-8 md:pb-0">
                    <Link href="/">
                        <Image
                            src="/assets/images/logo.svg"
                            alt="Logo"
                            width={300}
                            height={50}
                            className="pb-4"
                        />
                    </Link>
                    <div className="flex flex-col gap-2 text-white">
                        <span>Copyright © 2023 Credit Bank PLC. <br/>
                            ISO 9001:2015 Certified</span>
                        <span>Regulated and licensed by the Central Bank of Kenya.</span>
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-6 pb-8 md:pb-0">
                    <div className="flex flex-col gap-2 text-white">
                        <Link href="tel:+254709072000" className="text-lg sm:text-xl md:text-2xl font-bold">
                            +254 70 907 2000
                        </Link>
                        <span className="text-gray-400">Contact Us</span>
                    </div>

                    <div className="flex flex-col gap-2 text-white">
                        <Link href="mailto:customerservice@creditbank.co.ke" className="text-lg sm:text-xl md:text-2xl font-bold">
                            customerservice@creditbank.co.ke
                        </Link>
                        <span className="text-gray-400">Customer service Email</span>
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-6">
                    <div className="flex flex-col gap-2 text-white">
                        <Link href="https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952">
                            <Image
                                src="/assets/images/App-Store.png"
                                width={200}
                                height={50}
                                alt="App store image"
                                className="cursor-pointer" // Adds a pointer cursor to indicate it's clickable
                            />
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2 text-white">
                        <Link href="https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank">
                            <Image
                                src="/assets/images/Google-Play.png"
                                width={200}
                                height={50}
                                alt="Google Play image"
                                className="cursor-pointer" // Adds a pointer cursor to indicate it's clickable
                            />
                        </Link>
                    </div>

                    <span className="text-gray-400">Download the Credit Bank App</span>
                </div>
            </div>
        </div>
    );
};

export default Footer;
