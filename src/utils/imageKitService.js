import ImageKit from "imagekit";

// Set up ImageKit instance with your credentials from the environment variables
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});


// Function to upload and compress image
export const uploadImage = async (file, userName, referralCode) => {
    try {
        const customFileName = `${userName}_${referralCode}.${file.name.split('.').pop()}`;

        // Upload to ImageKit (optional: set transformation parameters for compression)
        const response = await imagekit.upload({
            file: file,
            fileName: customFileName,
            useUniqueFileName: false,
            folder: 'Credit_Bank_Campaign_User_Photos',
            options: {
                transformation: [
                    {
                        width: 800,
                        height: 600,
                        quality: 80
                    }
                ]
            }
        });

        // Save the response fileId along with the URL
        const fileUrl = response.url;
        const fileId = response.fileId;  // Get the fileId here

        return { fileUrl, fileId }; // Return both URL and fileId
    } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
    }
};

export { imagekit }; // You can also export imagekit if needed for deletion or other operations
