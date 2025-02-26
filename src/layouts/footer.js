import Image from "next/image";
import Link from "next/link";

const Footer = ({ mode }) => {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <div className="bg-[#1a1c23] px-6 sm:px-10 md:px-20 pt-8 pb-12">
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
                            <span>
                                Credit Bank PLC, <br />
                                Head Office, One Africa Place Building, <br />
                                14th Floor, Westlands, <br />
                                Waiyaki Way, Nairobi
                            </span>
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
                                    className="cursor-pointer transition-transform duration-300 hover:-translate-y-1"
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
                                    className="cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                                />
                            </Link>
                        </div>
                        <span className="text-gray-400">Download the Credit Bank App</span>
                    </div>
                </div>
            </div>
            <div className="bg-[#121419] py-4 text-center text-white">
                <p className="text-small">
                    Copyright © {currentYear} Credit Bank PLC. ISO 9001:2015 Certified. Regulated and licensed by the Central Bank of Kenya.
                </p>
            </div>
        </>
    );
};

export default Footer;