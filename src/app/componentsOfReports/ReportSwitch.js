"use client";

import { Switch } from "antd";
import { useRouter, usePathname } from "next/navigation";

export default function ReportSwitch() {
    const router = useRouter();
    const pathname = usePathname();

    const handleSwitch = (checked) => {
        const route = checked ? "/Basereport" : "/Reports";

        // Store the selected page
        localStorage.setItem("reportPage", route);

        // Navigate
        router.push(route);
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
            }}
        >
            <Switch
                style={{
                    backgroundColor:
                        pathname === "/Basereport" ? "#91c25f" : undefined,
                }}
                checked={pathname === "/Basereport"}
                checkedChildren="R"
                unCheckedChildren="S"
                onChange={handleSwitch}
            />
        </div>
    );
}