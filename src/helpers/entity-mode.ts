export type EntityModeResult = {
  isAddMode: boolean;
  isInvalid: boolean;
  isEditMode: boolean;
  entityId: number | null;
  normalizedValue?: string;
};

export const getEntityModeFromParam = ({
  param,
  addKeyword = "new",
}: {
  addKeyword?: string;
  param?: string | string[];
}): EntityModeResult => {
  const normalizedValue = Array.isArray(param) ? param[0] : param;

  if (!normalizedValue) {
    return {
      normalizedValue,
      isAddMode: false,
      isEditMode: false,
      entityId: null,
      isInvalid: true,
    };
  }

  const normalizedKeyword = addKeyword?.toLowerCase?.();
  const normalizedValueLower = normalizedValue?.toLowerCase?.();

  if (
    normalizedKeyword &&
    normalizedValueLower?.includes?.(normalizedKeyword)
  ) {
    return {
      entityId: null,
      normalizedValue,
      isAddMode: true,
      isInvalid: false,
      isEditMode: false,
    };
  }

  const parsedId = Number(normalizedValue);

  if (Number.isFinite(parsedId) && parsedId > 0) {
    return {
      normalizedValue,
      isInvalid: false,
      isAddMode: false,
      isEditMode: true,
      entityId: parsedId,
    };
  }

  return {
    normalizedValue,
    entityId: null,
    isInvalid: true,
    isAddMode: false,
    isEditMode: false,
  };
};
