import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { PAGE_404_TITLE } from '@config/Identifier/common/common';
import { NOT_FOUND_COMPONENT } from '@config/Identifier/common/common.error';

export default function NotFound({ route }: { route?: string }) {
  const { t } = useBaseRoutePage();
  return (
    <div className="flex flex-col justify-center min-h-screen py-6 bg-background sm:py-12">
      <div className="relative py-3 mx-auto sm:max-w-xl">
        <h1 className="text-text text-2xl font-bold text-center">
          {route ? `${t(NOT_FOUND_COMPONENT)}: ${route}` : t(PAGE_404_TITLE)}
        </h1>
      </div>
    </div>
  );
}
