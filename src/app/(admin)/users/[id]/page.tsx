"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { classNames } from "primereact/utils";
import { StepperFormHeading } from "@/components";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { Input, Button, Dropdown, MultiSelect } from "@/components/forms";
import { branchesData, projectsData, userRolesData } from "@/utils/dummy";

const statusOptions = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
];

const BRANCH_OPERATOR_ROLE_ID = 3; // Branch Operator role ID

const UpsertUserPage = () => {
  const [selectedUserRole, setSelectedUserRole] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const router = useRouter();
  const { id: userIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: userId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: userIdParam,
  });

  // Check if selected role is Branch Operator
  const isBranchOperator = selectedUserRole === BRANCH_OPERATOR_ROLE_ID;

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  // Reset branch and projects when role changes away from Branch Operator
  useEffect(() => {
    if (!isBranchOperator) {
      setSelectedBranch(null);
      setSelectedProjects([]);
    }
  }, [isBranchOperator]);

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    // Handle form submission here
    router.replace(`/users`);
  };

  const branchOptions = branchesData.map((branch) => ({
    label: branch.nameEn,
    value: branch.id,
  }));

  const projectOptions = projectsData.map((project) => ({
    label: project.nameEn,
    value: project.id,
  }));

  const userRoleOptions = userRolesData.map((role) => ({
    label: role.nameEn,
    value: role.id,
  }));

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add User" : "Edit User"} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6 mt-5 md:mt-0 w-full md:max-w-5xl content-start flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input label="Name" className="w-full" placeholder="Enter name" />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              label="Arabic Name"
              className="w-full text-right"
              placeholder="أدخل الاسم بالعربية"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              label="Email"
              className="w-full"
              placeholder="Enter email"
              type="email"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="User Role"
              className="w-full"
              options={userRoleOptions}
              placeholder="Choose"
              selectedItem={selectedUserRole}
              setSelectedItem={setSelectedUserRole}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="Status"
              className="w-full"
              options={statusOptions}
              placeholder="Choose"
              selectedItem={selectedStatus}
              setSelectedItem={setSelectedStatus}
            />
          </div>
          {isBranchOperator && (
            <>
              <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                <Dropdown
                  label="Branch"
                  className="w-full"
                  options={branchOptions}
                  placeholder="Choose branch"
                  selectedItem={selectedBranch}
                  setSelectedItem={setSelectedBranch}
                />
              </div>
              <div
                className={classNames(FORM_FIELD_WIDTHS["2"], "md:col-span-2")}
              >
                <MultiSelect
                  small
                  filter
                  label="Projects"
                  className="w-full"
                  options={projectOptions}
                  placeholder="Choose projects"
                  selectedItem={selectedProjects}
                  setSelectedItem={setSelectedProjects}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end px-6">
          <Button
            size="small"
            variant="text"
            onClick={() => router.replace("/users")}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="solid"
            onClick={handleSubmit}
            className="w-28 justify-center!"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpsertUserPage;
