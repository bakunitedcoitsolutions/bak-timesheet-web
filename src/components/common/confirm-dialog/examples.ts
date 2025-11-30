/**
 * CustomConfirmDialog Usage Examples
 *
 * The CustomConfirmDialog component is globally available throughout the entire application.
 * You can trigger it from anywhere using the showConfirmDialog helper function.
 *
 * NEW: Now supports async operations with loading states!
 */

import { showConfirmDialog } from "@/components/common/confirm-dialog";

// Simulated API call helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Example 1: Delete Confirmation with Async API Call
export const handleDeleteItem = (itemId: string) => {
  showConfirmDialog({
    title: "Delete Item",
    message:
      "Are you sure you want to delete this item? This action cannot be undone.",
    icon: "pi pi-trash",
    iconColor: "bg-red-500",
    acceptLabel: "Delete",
    rejectLabel: "Cancel",
    showCancel: true,
    onAccept: async () => {
      // Async delete logic - dialog will show loading spinner
      console.log(`Deleting item ${itemId}...`);

      // Simulate API call
      await delay(2000);

      console.log(`Item ${itemId} deleted successfully!`);
      // Dialog will automatically close after this completes
    },
    onReject: () => {
      console.log("Deletion cancelled");
    },
  });
};

// Example 2: Save Changes with Async API Call
export const handleSaveChanges = (data: any) => {
  showConfirmDialog({
    title: "Save Changes",
    message: "Do you want to save your changes?",
    icon: "pi pi-save",
    iconColor: "bg-green-500",
    acceptLabel: "Save",
    rejectLabel: "Discard",
    showCancel: true,
    onAccept: async () => {
      console.log("Saving changes...", data);

      // Simulate API call
      await delay(1500);

      console.log("Changes saved successfully!");
      // Dialog closes automatically
    },
    onReject: () => {
      console.log("Changes discarded");
    },
  });
};

// Example 3: Logout with Async Session Clear
export const handleLogout = () => {
  showConfirmDialog({
    title: "Logout",
    message: "Are you sure you want to logout from your account?",
    icon: "pi pi-sign-out",
    iconColor: "bg-orange-500",
    acceptLabel: "Logout",
    showCancel: false,
    onAccept: async () => {
      console.log("Logging out...");

      // Simulate clearing session
      await delay(1000);

      console.log("Logged out successfully!");
      // Redirect to login page
      window.location.href = "/login";
    },
  });
};

// Example 4: Submit Form with Async Validation & API Call
export const handleSubmitForm = (formData: any) => {
  showConfirmDialog({
    title: "Submit Form",
    message:
      "Are you sure you want to submit this form? Please review your information before proceeding.",
    icon: "pi pi-check-circle",
    iconColor: "bg-blue-500",
    acceptLabel: "Submit",
    rejectLabel: "Review",
    showCancel: true,
    onAccept: async () => {
      console.log("Submitting form...", formData);

      // Simulate API call
      await delay(5000);

      console.log("Form submitted successfully!");
      // Dialog closes automatically
    },
  });
};

// Example 5: Sync Operation (No Loading State)
export const handleSimpleConfirm = () => {
  showConfirmDialog({
    title: "Confirm Action",
    message: "This is a simple synchronous confirmation.",
    icon: "pi pi-question",
    iconColor: "bg-blue-500",
    acceptLabel: "OK",
    showCancel: true,
    onAccept: () => {
      // Synchronous operation - dialog closes immediately
      console.log("Action confirmed!");
    },
  });
};

// Example 6: Async with Error Handling
export const handleDeleteWithErrorHandling = (itemId: string) => {
  showConfirmDialog({
    title: "Delete Item",
    message: "Are you sure you want to delete this item?",
    icon: "pi pi-trash",
    iconColor: "bg-red-500",
    acceptLabel: "Delete",
    rejectLabel: "Cancel",
    showCancel: true,
    onAccept: async () => {
      try {
        console.log(`Deleting item ${itemId}...`);

        // Simulate API call that might fail
        await delay(1500);

        // Simulate random error
        if (Math.random() > 0.7) {
          throw new Error("Failed to delete item");
        }

        console.log("Item deleted successfully!");
        // Dialog closes on success
      } catch (error) {
        console.error("Delete failed:", error);
        // Dialog stays open on error
        alert("Failed to delete item. Please try again.");
      }
    },
  });
};

// Example 7: Warning/Alert (No Cancel)
export const showWarning = (message: string) => {
  showConfirmDialog({
    title: "Warning",
    message: message,
    icon: "pi pi-exclamation-triangle",
    iconColor: "bg-yellow-500",
    acceptLabel: "OK",
    showCancel: false,
    onAccept: () => {
      console.log("Warning acknowledged");
    },
  });
};

// Example 8: Success Notification
export const showSuccess = (message: string) => {
  showConfirmDialog({
    title: "Success",
    message: message,
    icon: "pi pi-check",
    iconColor: "bg-green-600",
    acceptLabel: "OK",
    showCancel: false,
    onAccept: () => {
      console.log("Success acknowledged");
    },
  });
};

// Example 9: Multiple Sequential Async Operations
export const handleMultipleAsyncOperations = () => {
  showConfirmDialog({
    title: "Start Process",
    message: "This will start a multi-step process. Continue?",
    icon: "pi pi-cog",
    iconColor: "bg-purple-500",
    acceptLabel: "Start",
    showCancel: true,
    onAccept: async () => {
      console.log("Step 1: Initializing...");
      await delay(1000);

      console.log("Step 2: Processing...");
      await delay(1000);

      console.log("Step 3: Finalizing...");
      await delay(1000);

      console.log("Process completed!");
      // Dialog closes after all steps complete
    },
  });
};

/**
 * Usage in a React Component:
 *
 * import { showConfirmDialog } from "@/components/common/confirm-dialog";
 *
 * function MyComponent() {
 *   const handleDelete = () => {
 *     showConfirmDialog({
 *       title: "Delete",
 *       message: "Are you sure?",
 *       onAccept: async () => {
 *         // Async operation with loading state
 *         await deleteItemAPI(itemId);
 *         // Dialog closes automatically after completion
 *       }
 *     });
 *   };
 *
 *   return <button onClick={handleDelete}>Delete</button>;
 * }
 */
