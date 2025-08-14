import React, { useState, useMemo, useEffect } from "react";
import {
    Contract,
    Client,
    Project,
    Profile,
    NavigationAction,
    Package,
} from "../types";
import PageHeader from "./PageHeader";
import Modal from "./Modal";
import SignaturePad from "./SignaturePad";
import StatCard from "./StatCard";
import {
    PlusIcon,
    EyeIcon,
    PencilIcon,
    Trash2Icon,
    PrinterIcon,
    QrCodeIcon,
    FileTextIcon,
    ClockIcon,
    CheckSquareIcon,
    DollarSignIcon,
} from "../constants";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return "[Tanggal belum diisi]";
    return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const initialFormState: Omit<
    Contract,
    "id" | "contractNumber" | "clientId" | "projectId" | "createdAt"
> = {
    signingDate: new Date().toISOString().split("T")[0],
    signingLocation: "",
    clientName1: "",
    clientAddress1: "",
    clientPhone1: "",
    clientName2: "",
    clientAddress2: "",
    clientPhone2: "",
    shootingDuration: "",
    guaranteedPhotos: "",
    albumDetails: "",
    digitalFilesFormat: "JPG High-Resolution",
    otherItems: "",
    personnelCount: "",
    deliveryTimeframe: "30 hari kerja",
    dpDate: "",
    finalPaymentDate: "",
    cancellationPolicy:
        "DP yang sudah dibayarkan tidak dapat dikembalikan.\nJika pembatalan dilakukan H-7 sebelum hari pelaksanaan, PIHAK KEDUA wajib membayar 50% dari total biaya.",
    jurisdiction: "",
};

const getSignatureStatus = (contract: Contract) => {
    if (contract.vendorSignature && contract.clientSignature) {
        return {
            text: "Lengkap",
            color: "bg-green-500/20 text-green-400",
            icon: <CheckSquareIcon className="w-4 h-4 text-green-500" />,
        };
    }
    if (contract.vendorSignature && !contract.clientSignature) {
        return {
            text: "Menunggu TTD Klien",
            color: "bg-blue-500/20 text-blue-400",
            icon: <ClockIcon className="w-4 h-4 text-blue-500" />,
        };
    }
    return {
        text: "Menunggu TTD Anda",
        color: "bg-yellow-500/20 text-yellow-400",
        icon: <ClockIcon className="w-4 h-4 text-yellow-500" />,
    };
};

interface ContractsProps {
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    clients: Client[];
    projects: Project[];
    profile: Profile;
    showNotification: (message: string) => void;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
    packages: Package[];
    onSignContract: (
        contractId: string,
        signatureDataUrl: string,
        signer: "vendor" | "client",
    ) => void;
}

const Contracts: React.FC<ContractsProps> = ({
    contracts,
    setContracts,
    clients,
    projects,
    profile,
    showNotification,
    initialAction,
    setInitialAction,
    packages,
    onSignContract,
}) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedContract, setSelectedContract] = useState<Contract | null>(
        null,
    );
    const [qrModalContent, setQrModalContent] = useState<{
        title: string;
        url: string;
    } | null>(null);

    // Form specific state
    const [formData, setFormData] = useState(initialFormState);
    const [selectedClientId, setSelectedClientId] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");

    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    useEffect(() => {
        if (qrModalContent) {
            const qrCodeContainer = document.getElementById(
                "contract-portal-qrcode",
            );
            if (
                qrCodeContainer &&
                typeof (window as any).QRCode !== "undefined"
            ) {
                qrCodeContainer.innerHTML = "";
                new (window as any).QRCode(qrCodeContainer, {
                    text: qrModalContent.url,
                    width: 200,
                    height: 200,
                    colorDark: "#020617", // slate-950
                    colorLight: "#ffffff",
                    correctLevel: 2, // H
                });
            }
        }
    }, [qrModalContent]);

    const handleOpenQrModal = (contract: Contract) => {
        const client = clients.find((c) => c.id === contract.clientId);
        if (client) {
            const url = `${window.location.origin}${window.location.pathname}#/portal/${client.portalAccessId}`;
            setQrModalContent({
                title: `Portal QR Code untuk ${client.name}`,
                url,
            });
        } else {
            showNotification("Klien untuk kontrak ini tidak ditemukan.");
        }
    };

    const availableProjects = useMemo(() => {
        return projects.filter((p) => p.clientId === selectedClientId);
    }, [selectedClientId, projects]);

    // Auto-populate form when project is selected
    useEffect(() => {
        if (selectedProjectId) {
            const project = projects.find((p) => p.id === selectedProjectId);
            const client = clients.find((c) => c.id === project?.clientId);
            if (project && client) {
                const pkg = packages.find((p) => p.id === project.packageId);
                const clientNames = client.name.split(/&|,/);
                setFormData((prev) => ({
                    ...prev,
                    clientName1: clientNames[0]?.trim() || client.name,
                    clientPhone1: client.phone,
                    clientAddress1: project.location,
                    clientName2: clientNames[1]?.trim() || "",
                    clientPhone2: client.phone,
                    clientAddress2: project.location,
                    jurisdiction:
                        project.location.split(",")[1]?.trim() ||
                        project.location.split(",")[0]?.trim() ||
                        "Indonesia",
                    signingLocation: profile.address,
                    dpDate:
                        project.amountPaid > 0
                            ? new Date().toISOString().split("T")[0]
                            : "",
                    finalPaymentDate: project.date
                        ? new Date(
                              new Date(project.date).setDate(
                                  new Date(project.date).getDate() - 7,
                              ),
                          )
                              .toISOString()
                              .split("T")[0]
                        : "",
                    shootingDuration:
                        pkg?.photographers || "Sesuai detail paket",
                    guaranteedPhotos:
                        pkg?.digitalItems.find((item) =>
                            item.toLowerCase().includes("foto edit"),
                        ) || "Sesuai detail paket",
                    albumDetails:
                        pkg?.physicalItems
                            .map((item) => item.name)
                            .join(", ") || "Tidak ada",
                    digitalFilesFormat:
                        pkg?.digitalItems.find((item) =>
                            item.toLowerCase().includes("file"),
                        ) || "JPG High-Resolution",
                    otherItems:
                        project.addOns.map((a) => a.name).join(", ") ||
                        "Tidak ada",
                    personnelCount:
                        [pkg?.photographers, pkg?.videographers]
                            .filter(Boolean)
                            .join(", ") || "Sesuai detail paket",
                    deliveryTimeframe: pkg?.processingTime || "30 hari kerja",
                }));
            }
        }
    }, [selectedProjectId, projects, clients, profile.address, packages]);

    // Handle initial action from another page (e.g., Clients page)
    useEffect(() => {
        if (initialAction) {
            if (
                initialAction.type === "CREATE_CONTRACT_FOR_CLIENT" &&
                initialAction.id
            ) {
                handleOpenModal("add");
                setSelectedClientId(initialAction.id);
            }
            if (initialAction.type === "VIEW_CONTRACT" && initialAction.id) {
                const contractToView = contracts.find(
                    (c) => c.id === initialAction.id,
                );
                if (contractToView) {
                    handleViewContract(contractToView);
                }
            }
            setInitialAction(null);
        }
    }, [initialAction, contracts, setInitialAction]);

    const handleOpenModal = (mode: "add" | "edit", contract?: Contract) => {
        setModalMode(mode);
        if (mode === "edit" && contract) {
            setSelectedContract(contract);
            setFormData(contract);
            setSelectedClientId(contract.clientId);
            setSelectedProjectId(contract.projectId);
        } else {
            setSelectedContract(null);
            setFormData(initialFormState);
            setSelectedClientId("");
            setSelectedProjectId("");
        }
        setIsFormModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setIsViewModalOpen(false);
        setSelectedContract(null);
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const contractNumber =
            selectedContract?.contractNumber ||
            `VP/CTR/${new Date().getFullYear()}/${String(contracts.length + 1).padStart(3, "0")}`;

        if (modalMode === "add") {
            const newContract: Contract = {
                id: `CTR${Date.now()}`,
                contractNumber,
                clientId: selectedClientId,
                projectId: selectedProjectId,
                createdAt: new Date().toISOString(),
                ...formData,
            };
            setContracts((prev) => [...prev, newContract]);
            showNotification(`Kontrak ${contractNumber} berhasil dibuat.`);
        } else if (modalMode === "edit" && selectedContract) {
            const updatedContract = {
                ...selectedContract,
                ...formData,
                clientId: selectedClientId,
                projectId: selectedProjectId,
            };
            setContracts((prev) =>
                prev.map((c) =>
                    c.id === selectedContract.id ? updatedContract : c,
                ),
            );
            showNotification(
                `Kontrak ${selectedContract.contractNumber} berhasil diperbarui.`,
            );
        }
        handleCloseModal();
    };

    const handleDelete = (contractId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kontrak ini?")) {
            setContracts((prev) => prev.filter((c) => c.id !== contractId));
            showNotification("Kontrak berhasil dihapus.");
        }
    };

    const handleViewContract = (contract: Contract) => {
        setSelectedContract(contract);
        setIsViewModalOpen(true);
    };

    const handleSaveSignature = (signatureDataUrl: string) => {
        if (selectedContract) {
            onSignContract(selectedContract.id, signatureDataUrl, "vendor");
            setSelectedContract((prev) =>
                prev ? { ...prev, vendorSignature: signatureDataUrl } : null,
            );
        }
        setIsSignatureModalOpen(false);
    };

    const renderDynamicContract = (contract: Contract) => {
        const client = clients.find((c) => c.id === contract.clientId);
        const project = projects.find((p) => p.id === contract.projectId);

        if (!client || !project) {
            return '<p class="text-center text-red-500">Data Klien atau Proyek tidak lengkap untuk kontrak ini.</p>';
        }

        const htmlContent = `
            <div class="prose prose-sm prose-invert max-w-none" style="--tw-prose-body: var(--color-text-primary); --tw-prose-headings: var(--color-text-light); --tw-prose-bold: var(--color-text-light);">
                <h2 class="text-xl font-bold text-center !mb-1">SURAT PERJANJIAN KERJA SAMA</h2>
                <h3 class="text-lg font-bold text-center !mb-6 !mt-0">JASA ${project.projectType.toUpperCase()}</h3>
                <p>Pada hari ini, ${new Date(contract.signingDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}, bertempat di ${contract.signingLocation}, telah dibuat dan disepakati perjanjian kerja sama antara:</p>

                <div class="my-4">
                    <p class="font-bold">PIHAK PERTAMA</p>
                    <table class="not-prose text-sm">
                        <tbody>
                            <tr><td class="pr-4 align-top w-1/4 py-1">Nama</td><td class="py-1">: ${profile.authorizedSigner}</td></tr>
                            <tr><td class="pr-4 align-top py-1">Jabatan</td><td class="py-1">: Pemilik Usaha</td></tr>
                            <tr><td class="pr-4 align-top py-1">Alamat</td><td class="py-1">: ${profile.address}</td></tr>
                            <tr><td class="pr-4 align-top py-1">Nomor Telepon</td><td class="py-1">: ${profile.phone}</td></tr>
                            ${profile.idNumber ? `<tr><td class="pr-4 align-top py-1">Nomor Identitas</td><td class="py-1">: ${profile.idNumber}</td></tr>` : ""}
                        </tbody>
                    </table>
                    <p class="mt-1">Dalam hal ini bertindak atas nama perusahaannya, <strong>${profile.companyName}</strong>, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</p>
                </div>

                <div class="my-4">
                    <p class="font-bold">PIHAK KEDUA</p>
                    <table class="not-prose text-sm">
                        <tbody>
                            <tr><td class="pr-4 align-top w-1/4 py-1">Nama</td><td class="py-1">: ${contract.clientName1}</td></tr>
                            <tr><td class="pr-4 align-top py-1">Alamat</td><td class="py-1">: ${contract.clientAddress1}</td></tr>
                            <tr><td class="pr-4 align-top py-1">Nomor Telepon</td><td class="py-1">: ${contract.clientPhone1}</td></tr>
                            ${
                                contract.clientName2
                                    ? `
                                <tr><td class="pr-4 align-top py-1">Nama</td><td class="py-1">: ${contract.clientName2}</td></tr>
                                <tr><td class="pr-4 align-top py-1">Alamat</td><td class="py-1">: ${contract.clientAddress2}</td></tr>
                                <tr><td class="pr-4 align-top py-1">Nomor Telepon</td><td class="py-1">: ${contract.clientPhone2}</td></tr>
                            `
                                    : ""
                            }
                        </tbody>
                    </table>
                    <p class="mt-1">Dalam hal ini bertindak atas nama pribadi/bersama, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.</p>
                </div>

                <div class="space-y-4 mt-6">
                    <div><h4 class="font-bold text-center !my-3">PASAL 1: DEFINISI</h4><p>Pekerjaan adalah jasa ${project.projectType.toLowerCase()} yang diberikan oleh PIHAK PERTAMA untuk acara PIHAK KEDUA. Hari Pelaksanaan adalah tanggal ${new Date(project.date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Lokasi Pelaksanaan adalah ${project.location}.</p></div>
                    <div><h4 class="font-bold text-center !my-3">PASAL 2: RUANG LINGKUP PEKERJAAN</h4><p>PIHAK PERTAMA akan memberikan jasa fotografi sesuai dengan paket ${project.packageName} yang mencakup: Durasi pemotretan ${contract.shootingDuration}, Jumlah foto ${contract.guaranteedPhotos}, ${contract.albumDetails}, File digital ${contract.digitalFilesFormat}, dan ${contract.otherItems}. PIHAK PERTAMA akan menyediakan ${contract.personnelCount}. Penyerahan hasil akhir dilakukan maksimal ${contract.deliveryTimeframe} setelah acara.</p></div>
                    <div><h4 class="font-bold text-center !my-3">PASAL 3: HAK DAN KEWAJIBAN PIHAK PERTAMA</h4><p>Hak: Menerima pembayaran sesuai kesepakatan; Menggunakan hasil foto untuk promosi/portofolio dengan persetujuan PIHAK KEDUA. Kewajiban: Melaksanakan pekerjaan secara profesional; Menyerahkan hasil tepat waktu; Menjaga privasi PIHAK KEDUA.</p></div>
                    <div><h4 class="font-bold text-center !my-3">PASAL 4: HAK DAN KEWAJIBAN PIHAK KEDUA</h4><p>Hak: Menerima hasil pekerjaan sesuai paket; Meminta revisi minor jika ada kesalahan teknis. Kewajiban: Melakukan pembayaran sesuai jadwal; Memberikan informasi yang dibutuhkan; Menjamin akses kerja di lokasi.</p></div>
                    <div><h4 class="font-bold text-center !my-3">PASAL 5: BIAYA DAN CARA PEMBAYARAN</h4><p>Total biaya jasa adalah sebesar ${formatCurrency(project.totalCost)}. Pembayaran dilakukan dengan sistem: Uang Muka (DP) sebesar ${formatCurrency(project.amountPaid)} dibayarkan pada ${formatDate(contract.dpDate)}; Pelunasan sebesar ${formatCurrency(project.totalCost - project.amountPaid)} dibayarkan paling lambat pada ${formatDate(contract.finalPaymentDate)}. Pembayaran dapat ditransfer ke rekening: ${profile.bankAccount}.</p></div>
                    <div><h4 class="font-bold text-center !my-3">PASAL 6: PEMBATALAN</h4><p>${contract.cancellationPolicy.replace(/\n/g, "<br/>")}</p></div>
                    <div><h4 class="font-bold text-center !my-3">PASAL 7: PENYELESAIAN SENGKETA</h4><p>Segala sengketa yang timbul akan diselesaikan secara musyawarah. Apabila tidak tercapai, maka akan diselesaikan secara hukum di wilayah hukum ${contract.jurisdiction}.</p></div>
                    <div><h4 class="font-bold text-center !my-3">PASAL 8: PENUTUP</h4><p>Demikian surat perjanjian ini dibuat dalam 2 (dua) rangkap bermaterai cukup dan mempunyai kekuatan hukum yang sama, ditandatangani dengan penuh kesadaran oleh kedua belah pihak.</p></div>
                </div>

                <table class="not-prose w-full mt-16 text-center">
                    <tbody>
                        <tr>
                            <td class="w-1/2">
                                <p class="font-bold">PIHAK PERTAMA</p>
                                <div class="h-28 my-1 flex items-center justify-center">
                                    ${contract.vendorSignature ? `<img src="${contract.vendorSignature}" alt="Tanda Tangan Vendor" class="h-24 object-contain" />` : `<div class="p-4 rounded-lg text-sm text-brand-text-secondary non-printable">Tanda Tangani di Sini</div><div class="print:hidden h-24"></div>`}
                                </div>
                                <p class="border-t-2 border-dotted w-4/5 mx-auto pt-1">(${profile.authorizedSigner})</p>
                            </td>
                            <td class="w-1/2">
                                <p class="font-bold">PIHAK KEDUA</p>
                                <div class="h-28 my-1 flex items-center justify-center">
                                    ${contract.clientSignature ? `<img src="${contract.clientSignature}" alt="Tanda Tangan Klien" class="h-24 object-contain" />` : `<span class="italic text-sm text-brand-text-secondary">Menunggu Tanda Tangan Klien</span>`}
                                </div>
                                <p class="border-t-2 border-dotted w-4/5 mx-auto pt-1">(${contract.clientName1}${contract.clientName2 ? ` & ${contract.clientName2}` : ""})</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        return htmlContent;
    };

    const contractStats = useMemo(() => {
        const pending = contracts.filter(
            (c) => !c.clientSignature || !c.vendorSignature,
        ).length;
        const signed = contracts.filter(
            (c) => c.clientSignature && c.vendorSignature,
        ).length;
        const totalValue = contracts.reduce((sum, c) => {
            const project = projects.find((p) => p.id === c.projectId);
            return sum + (project?.totalCost || 0);
        }, 0);
        return { total: contracts.length, pending, signed, totalValue };
    }, [contracts, projects]);

    return (
        <div className="space-y-8">
            <PageHeader
                title="Manajemen Kontrak Kerja"
                subtitle="Buat, kelola, dan cetak semua kontrak kerja klien Anda."
            >
                <button
                    onClick={() => handleOpenModal("add")}
                    className="button-primary inline-flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Buat Kontrak Baru
                </button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<FileTextIcon className="w-6 h-6" />}
                    title="Total Kontrak"
                    value={contractStats.total.toString()}
                />
                <StatCard
                    icon={<ClockIcon className="w-6 h-6" />}
                    title="Menunggu TTD"
                    value={contractStats.pending.toString()}
                    iconBgColor="bg-yellow-500/20"
                    iconColor="text-yellow-400"
                />
                <StatCard
                    icon={<CheckSquareIcon className="w-6 h-6" />}
                    title="Sudah Lengkap TTD"
                    value={contractStats.signed.toString()}
                    iconBgColor="bg-green-500/20"
                    iconColor="text-green-400"
                />
                <StatCard
                    icon={<DollarSignIcon className="w-6 h-6" />}
                    title="Total Nilai Kontrak"
                    value={formatCurrency(contractStats.totalValue)}
                    iconBgColor="bg-blue-500/20"
                    iconColor="text-blue-400"
                />
            </div>

            <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border">
                <h3 className="text-xl font-bold text-gradient mb-4">
                    Daftar Kontrak
                </h3>
                <div className="space-y-4">
                    {contracts.map((contract) => {
                        const project = projects.find(
                            (p) => p.id === contract.projectId,
                        );
                        const client = clients.find(
                            (c) => c.id === contract.clientId,
                        );
                        const status = getSignatureStatus(contract);
                        return (
                            <div
                                key={contract.id}
                                className="p-4 bg-brand-bg rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4"
                                style={{
                                    borderLeftColor: status.color.startsWith(
                                        "bg-green",
                                    )
                                        ? "#10b981"
                                        : status.color.startsWith("bg-blue")
                                          ? "#3b82f6"
                                          : "#eab308",
                                }}
                            >
                                <div>
                                    <p className="font-semibold text-brand-text-light">
                                        {contract.contractNumber}
                                    </p>
                                    <p className="text-sm text-brand-text-primary">
                                        {project?.projectName ||
                                            "Proyek tidak ditemukan"}
                                    </p>
                                    <p className="text-xs text-brand-text-secondary">
                                        Klien: {client?.name || "N/A"}
                                    </p>
                                </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                                    <div className="text-left md:text-right">
                                        <p className="font-semibold text-brand-text-primary">
                                            {formatCurrency(
                                                project?.totalCost || 0,
                                            )}
                                        </p>
                                        <p className="text-xs text-brand-text-secondary">
                                            Dibuat:{" "}
                                            {new Date(
                                                contract.createdAt,
                                            ).toLocaleDateString("id-ID")}
                                        </p>
                                    </div>
                                    <div
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-2 ${status.color}`}
                                    >
                                        {status.icon}
                                        {status.text}
                                    </div>
                                    <div className="flex items-center justify-center space-x-1 border-l border-brand-border pl-4">
                                        <button
                                            onClick={() =>
                                                handleViewContract(contract)
                                            }
                                            className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"
                                            title="Lihat & Cetak"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleOpenQrModal(contract)
                                            }
                                            className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"
                                            title="Bagikan QR Portal"
                                        >
                                            <QrCodeIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleOpenModal(
                                                    "edit",
                                                    contract,
                                                )
                                            }
                                            className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"
                                            title="Edit"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(contract.id)
                                            }
                                            className="p-2 text-brand-text-secondary hover:bg-brand-input rounded-full"
                                            title="Hapus"
                                        >
                                            <Trash2Icon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {contracts.length === 0 && (
                        <p className="text-center py-10 text-brand-text-secondary">
                            Belum ada kontrak yang dibuat.
                        </p>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isFormModalOpen}
                onClose={handleCloseModal}
                title={
                    modalMode === "add" ? "Buat Kontrak Baru" : "Edit Kontrak"
                }
                size="5xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <div>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">
                                Data Awal
                            </h4>
                            <div className="input-group">
                                <select
                                    value={selectedClientId}
                                    onChange={(e) =>
                                        setSelectedClientId(e.target.value)
                                    }
                                    className="input-field"
                                    required
                                >
                                    <option value="">Pilih Klien...</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <label className="input-label">Klien</label>
                            </div>
                            <div className="input-group">
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) =>
                                        setSelectedProjectId(e.target.value)
                                    }
                                    className="input-field"
                                    required
                                    disabled={!selectedClientId}
                                >
                                    <option value="">Pilih Proyek...</option>
                                    {availableProjects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.projectName}
                                        </option>
                                    ))}
                                </select>
                                <label className="input-label">Proyek</label>
                            </div>

                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mt-6 mb-4">
                                Detail Pihak Kedua (1)
                            </h4>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="clientName1"
                                    value={formData.clientName1}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Nama Klien 1
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="clientAddress1"
                                    value={formData.clientAddress1}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Alamat Klien 1
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="clientPhone1"
                                    value={formData.clientPhone1}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Telepon Klien 1
                                </label>
                            </div>

                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mt-6 mb-4">
                                Detail Pihak Kedua (2) - Opsional
                            </h4>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="clientName2"
                                    value={formData.clientName2}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Nama Klien 2
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="clientAddress2"
                                    value={formData.clientAddress2}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Alamat Klien 2
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="clientPhone2"
                                    value={formData.clientPhone2}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Telepon Klien 2
                                </label>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mb-4">
                                Pasal 2: Lingkup Pekerjaan
                            </h4>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="shootingDuration"
                                    value={formData.shootingDuration}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Durasi Pemotretan
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="guaranteedPhotos"
                                    value={formData.guaranteedPhotos}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Jumlah Foto Dijamin
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="albumDetails"
                                    value={formData.albumDetails}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Detail Album Cetak
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="digitalFilesFormat"
                                    value={formData.digitalFilesFormat}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Format File Digital
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="otherItems"
                                    value={formData.otherItems}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Item Lainnya (e.g., Video)
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="personnelCount"
                                    value={formData.personnelCount}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Jumlah Personel
                                </label>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="deliveryTimeframe"
                                    value={formData.deliveryTimeframe}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Waktu Penyerahan Hasil
                                </label>
                            </div>

                            <h4 className="text-base font-semibold text-gradient border-b border-brand-border pb-2 mt-6 mb-4">
                                Pasal Lainnya
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <input
                                        type="date"
                                        name="dpDate"
                                        value={formData.dpDate}
                                        onChange={handleFormChange}
                                        className="input-field"
                                        placeholder=" "
                                    />
                                    <label className="input-label">
                                        Tanggal Pembayaran DP
                                    </label>
                                </div>
                                <div className="input-group">
                                    <input
                                        type="date"
                                        name="finalPaymentDate"
                                        value={formData.finalPaymentDate}
                                        onChange={handleFormChange}
                                        className="input-field"
                                        placeholder=" "
                                    />
                                    <label className="input-label">
                                        Tanggal Pelunasan
                                    </label>
                                </div>
                                <div className="input-group">
                                    <input
                                        type="date"
                                        name="signingDate"
                                        value={formData.signingDate}
                                        onChange={handleFormChange}
                                        className="input-field"
                                        placeholder=" "
                                    />
                                    <label className="input-label">
                                        Tanggal TTD
                                    </label>
                                </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="signingLocation"
                                        value={formData.signingLocation}
                                        onChange={handleFormChange}
                                        className="input-field"
                                        placeholder=" "
                                    />
                                    <label className="input-label">
                                        Lokasi TTD
                                    </label>
                                </div>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="jurisdiction"
                                    value={formData.jurisdiction}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Wilayah Hukum (Sengketa)
                                </label>
                            </div>
                            <div className="input-group">
                                <textarea
                                    name="cancellationPolicy"
                                    value={formData.cancellationPolicy}
                                    onChange={handleFormChange}
                                    className="input-field"
                                    rows={4}
                                    placeholder=" "
                                />
                                <label className="input-label">
                                    Kebijakan Pembatalan
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-brand-border">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="button-secondary"
                        >
                            Batal
                        </button>
                        <button type="submit" className="button-primary">
                            {modalMode === "add"
                                ? "Simpan Kontrak"
                                : "Update Kontrak"}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isViewModalOpen}
                onClose={handleCloseModal}
                title={`Detail Kontrak: ${selectedContract?.contractNumber}`}
                size="4xl"
            >
                {selectedContract && (
                    <div>
                        <div
                            className="printable-area max-h-[65vh] overflow-y-auto pr-4"
                            dangerouslySetInnerHTML={{
                                __html: renderDynamicContract(selectedContract),
                            }}
                        ></div>
                        <div className="mt-6 text-right non-printable space-x-2 border-t border-brand-border pt-4">
                            {selectedContract &&
                                !selectedContract.vendorSignature && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsSignatureModalOpen(true)
                                        }
                                        className="button-secondary"
                                    >
                                        Tanda Tangani
                                    </button>
                                )}
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="button-primary inline-flex items-center gap-2"
                            >
                                <PrinterIcon className="w-4 h-4" /> Cetak /
                                Simpan PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                title="Bubuhkan Tanda Tangan Anda"
            >
                <SignaturePad
                    onClose={() => setIsSignatureModalOpen(false)}
                    onSave={handleSaveSignature}
                />
            </Modal>
            {qrModalContent && (
                <Modal
                    isOpen={!!qrModalContent}
                    onClose={() => setQrModalContent(null)}
                    title={qrModalContent.title}
                    size="sm"
                >
                    <div className="text-center p-4">
                        <div
                            id="contract-portal-qrcode"
                            className="p-4 bg-white rounded-lg inline-block mx-auto"
                        ></div>
                        <p className="text-xs text-brand-text-secondary mt-4 break-all">
                            {qrModalContent.url}
                        </p>
                        <button
                            onClick={() => {
                                const canvas = document.querySelector(
                                    "#contract-portal-qrcode canvas",
                                ) as HTMLCanvasElement;
                                if (canvas) {
                                    const link = document.createElement("a");
                                    link.download = "portal-qr.png";
                                    link.href = canvas.toDataURL();
                                    link.click();
                                }
                            }}
                            className="mt-6 button-primary w-full"
                        >
                            Unduh
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Contracts;
