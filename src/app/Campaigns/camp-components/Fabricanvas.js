// // components/FabricCanvas.js
// "use client";
// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { TABS, TOOLS } from "react-filerobot-image-editor";

// // Dynamically import the editor
// const DynamicFilerobotImageEditor = dynamic(
//     () => import("react-filerobot-image-editor"),
//     { ssr: false }
// );

// export default function FabricCanvas({
//     initialImage = "",
//     closeCanvasModal,
//     onSaveEditedImage,
// }) {
//     const [isImgEditorShown, setIsImgEditorShown] = useState(false);
//     const [imageSource, setImageSource] = useState(initialImage);

//     useEffect(() => {
//         setIsImgEditorShown(Boolean(imageSource));
//     }, [imageSource]);

//     const closeImgEditor = () => {
//         setIsImgEditorShown(false);
//         setImageSource("");
//         closeCanvasModal?.();
//     };

//     const handleSave = (editedImageObject) => {
//         onSaveEditedImage?.(editedImageObject);
//         closeImgEditor();
//     };

//     return (
//         <div>
//             {isImgEditorShown && imageSource && (
//                 <div
//                     style={{
//                         width: "90vw",
//                         height: "90vh",
//                         margin: "0 auto",
//                         position: "fixed",
//                         top: "5vh",
//                         left: "5vw",
//                         zIndex: 1000,
//                     }}
//                 >
//                     <DynamicFilerobotImageEditor
//                         source={imageSource}
//                         onSave={handleSave}
//                         onClose={closeImgEditor}
//                         annotationsCommon={{ fill: "#ff0000" }}
//                         tabsIds={[
//                             TABS.ADJUST,
//                             TABS.FINETUNE,
//                             TABS.FILTERS,
//                             TABS.WATERMARK,
//                             TABS.ANNOTATE,
//                             TABS.RESIZE,
//                         ]}
//                         defaultTabId={TABS.ADJUST}
//                         toolsIds={[
//                             TOOLS.RESIZE,
//                             TOOLS.CROP,
//                             TOOLS.DRAW,
//                             TOOLS.FILTERS,
//                             TOOLS.TEXT,
//                             TOOLS.WATERMARK,
//                         ]}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// }

// components/FabricCanvas.js
// components/FabricCanvas.js
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { TABS, TOOLS } from "react-filerobot-image-editor";
import { useTokenContext } from "../../components/parent";
// import { TABS, TOOLS } from "react-filerobot-image-editor";
// Dynamically import the editor to avoid SSR issues
const DynamicFilerobotImageEditor = dynamic(() => import("react-filerobot-image-editor"), { ssr: false });

export default function FabricCanvas({
    fileId,
    initialImage = "",
    closeCanvasModal,
    onSaveEditedImage,
}) {
    const { userdetails } = useTokenContext();
    const [isImgEditorShown, setIsImgEditorShown] = useState(false);
    const [imageSource, setImageSource] = useState(initialImage);

    useEffect(() => {
        setIsImgEditorShown(Boolean(imageSource));
    }, [imageSource]);

    const closeImgEditor = () => {
        setIsImgEditorShown(false);
        setImageSource("");
        closeCanvasModal?.();
    };

    const handleSave = (editedImageObject) => {
        onSaveEditedImage(fileId, editedImageObject);
        closeImgEditor();
    };

    return (
        <div>
            {isImgEditorShown && imageSource && (
                <div style={{ width: "80vw", height: "90vh", position: "fixed", top: "5vh", left: "5vw", zIndex: 1000 }}>
                    <DynamicFilerobotImageEditor
                        source={imageSource}
                        onSave={handleSave}
                        onClose={closeImgEditor}
                        annotationsCommon={{ fill: "#ff0000" }}
                        tabsIds={[TABS.ADJUST, TABS.FINETUNE, TABS.FILTERS, TABS.WATERMARK, TABS.ANNOTATE, TABS.RESIZE]}
                        defaultTabId={TABS.ADJUST}
                        toolsIds={[TOOLS.RESIZE, TOOLS.CROP, TOOLS.DRAW, TOOLS.FILTERS, TOOLS.TEXT, TOOLS.WATERMARK]}
                    />
                </div>
            )}
        </div>
    );
}
