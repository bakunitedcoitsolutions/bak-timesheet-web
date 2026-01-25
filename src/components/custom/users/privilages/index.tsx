import { Checkbox } from "@/components/forms";
import { classNames } from "primereact/utils";

import { UserPrivileges, FeaturePermissions } from "@/utils/dummy";
import { FEATURES_CONFIG, FORM_FIELD_WIDTHS } from "@/utils/constants";

const Privileges = ({
  privileges,
  handleFeatureToggle,
  handlePrivilegeChange,
  isFeatureEnabled,
}: {
  privileges: UserPrivileges;
  handleFeatureToggle: (
    featureKey: keyof UserPrivileges,
    enabled: boolean
  ) => void;
  handlePrivilegeChange: (
    featureKey: keyof UserPrivileges,
    permissionKey: keyof FeaturePermissions,
    checked: boolean
  ) => void;
  isFeatureEnabled: (featureKey: keyof UserPrivileges) => boolean;
}) => {
  return (
    <div className={classNames(FORM_FIELD_WIDTHS["full"], "md:col-span-2")}>
      <div className="rounded-lg p-6 bg-primary-light/50">
        <h3 className="text-lg font-semibold text-primary mb-4">Privileges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES_CONFIG.map((feature) => {
            const isEnabled = isFeatureEnabled(feature.key);
            const featurePrivileges = privileges[feature.key];

            return (
              <div
                key={feature.key}
                className="border border-primary/50 rounded-lg p-4 bg-white"
              >
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <Checkbox
                    label={feature.label}
                    checked={isEnabled}
                    onChange={(checked: boolean) => {
                      handleFeatureToggle(feature.key, checked);
                    }}
                    name={`${feature.key}-section`}
                    className="font-semibold"
                    labelClassName="text-base font-semibold"
                  />
                </div>
                {isEnabled && featurePrivileges && (
                  <>
                    {/* Show permissions for non-reports features */}
                    {feature.key !== "reports" && (
                      <div className="flex flex-col gap-4 pl-6">
                        {feature.permissions
                          .filter((permission) => {
                            // If feature only has "full" permission, don't show sub-checkboxes
                            // The section checkbox directly controls it
                            const hasOnlyFull =
                              feature.permissions.length === 1 &&
                              feature.permissions[0].key === "full";
                            return !hasOnlyFull;
                          })
                          .map((permission) => (
                            <Checkbox
                              key={permission.key}
                              label={permission.label}
                              checked={Boolean(
                                (
                                  featurePrivileges as unknown as Record<
                                    string,
                                    boolean
                                  >
                                )[permission.key]
                              )}
                              onChange={(checked: boolean) =>
                                handlePrivilegeChange(
                                  feature.key,
                                  permission.key,
                                  checked as boolean
                                )
                              }
                              name={`${feature.key}-${permission.key}`}
                            />
                          ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Privileges;
