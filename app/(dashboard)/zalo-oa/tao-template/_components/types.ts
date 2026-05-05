export type TemplateType = "1" | "2" | "3" | "4" | "5";
export type TemplateTag = "1" | "2" | "3";
export type ComponentType = "TITLE" | "PARAGRAPH" | "TABLE";
export type HeaderVariant = "LOGO" | "IMAGE";

export interface TableItem {
  key: string;
  value: string;
}

export interface BodyComponent {
  id: string;
  type: ComponentType;
  text: string;
  items: TableItem[];
}

export interface FooterButton {
  id: string;
  title: string;
  content: string;
}

export interface TemplateParam {
  id: string;
  name: string;
  type: string;
  sample_value: string;
}

export interface FormState {
  oaId: string;
  template_name: string;
  template_type: TemplateType;
  tag: TemplateTag;
  note: string;
  header: HeaderState;
  bodyComponents: BodyComponent[];
  footerButtons: FooterButton[];
  params: TemplateParam[];
}

export interface HeaderState {
  /** null = không dùng header */
  variant: HeaderVariant | null;
  /** LOGO — light mode */
  lightFile: File | null;
  lightPreview: string;
  lightMediaId: string;
  /** LOGO — dark mode */
  darkFile: File | null;
  darkPreview: string;
  darkMediaId: string;
  /** IMAGE */
  imageFile: File | null;
  imagePreview: string;
  imageMediaId: string;
}
