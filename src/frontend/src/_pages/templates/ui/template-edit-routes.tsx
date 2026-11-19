import { TemplateEditDialog } from "./template-edit-dialog";
import { TemplatesPage } from "./templates-page";

type TemplateRouteProps = { params: Promise<{ id: string }> };

export async function TemplateEditModal({ params }: TemplateRouteProps) {
  const { id } = await params;
  return <TemplateEditDialog id={id} dismissal="back" />;
}

export async function TemplatesEditPage({ params }: TemplateRouteProps) {
  const { id } = await params;
  return (
    <>
      <TemplatesPage />
      <TemplateEditDialog id={id} dismissal="to-list" />
    </>
  );
}
