import { UserOption } from "../utils/customerGroupDetailUtils";

type AssigneeRoleSectionProps = {
    title: string;
    users: UserOption[];
    selectedIds: string[];
    onToggle: (userId: string) => void;
    disabled: boolean;
};

export function AssigneeRoleSection({
    title,
    users,
    selectedIds,
    onToggle,
    disabled,
}: AssigneeRoleSectionProps) {
    return (
        <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {title} ({users.length})
            </div>

            {users.length === 0 ? (
                <p className="px-3 py-3 text-sm text-gray-500">Không có user phù hợp.</p>
            ) : (
                <div className="max-h-44 overflow-y-auto">
                    <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => {
                                const isChecked = selectedIds.includes(user.id);

                                return (
                                    <tr key={user.id} className={isChecked ? "bg-primary-50" : "hover:bg-gray-50"}>
                                        <td className="px-3 py-2 w-10">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => onToggle(user.id)}
                                                disabled={disabled}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-900">{user.label}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
