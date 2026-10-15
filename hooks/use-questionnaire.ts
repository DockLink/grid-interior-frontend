"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApiClient } from "@/lib/api/authenticated-client";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import { queryKeys } from "@/lib/query/keys";
import type {
  ConsultQuestionnaireAnswers,
  ConsultQuestionnaireResponse,
} from "@/types/consultation";

function questionnairePath(projectId: string) {
  return `/projects/${projectId}/consultation/questionnaire`;
}

export function useQuestionnaire(projectId: string) {
  const qc = useQueryClient();
  const authOff = isAuthDisabled();
  const qKey = queryKeys.consultation.questionnaire(projectId);

  const query = useQuery({
    queryKey: qKey,
    queryFn: () => authApiClient<ConsultQuestionnaireResponse>(questionnairePath(projectId)),
    enabled: Boolean(projectId) && !authOff,
    staleTime: 15_000,
  });

  const saveMutation = useMutation({
    mutationFn: (answers: ConsultQuestionnaireAnswers) =>
      authApiClient<ConsultQuestionnaireResponse>(questionnairePath(projectId), {
        method: "PUT",
        body: JSON.stringify({ answers }),
      }),
    onSuccess: (data) => {
      qc.setQueryData(qKey, data);
    },
  });

  return {
    answers: query.data?.answers ?? null,
    updatedAt: query.data?.updated_at ?? null,
    isLoading: Boolean(projectId) && !authOff && query.isLoading,
    isFetched: authOff || query.isFetched,
    isAuthOff: authOff,
    isSaving: saveMutation.isPending,
    save: (answers: ConsultQuestionnaireAnswers) => saveMutation.mutateAsync(answers),
  };
}
