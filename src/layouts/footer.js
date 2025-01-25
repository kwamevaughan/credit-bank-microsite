const Footer = ({ mode }) => {
    const currentYear = new Date().getFullYear();

    return (
        <div
            className={`flex justify-center items-center h-16 w-full p-4 shadow-md ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-white text-black'}`}>
            <p className="text-center">
                © {currentYear},
                <span className="mx-0.2"> </span>
                <a
                    href="https://growthpad.co.ke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="">
                    Growthpad Consultancy Group
                </a>
            </p>
        </div>
    );
};

export default Footer;
