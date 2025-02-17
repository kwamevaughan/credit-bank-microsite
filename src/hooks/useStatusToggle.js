// hooks/useStatusToggle.js
import { useState } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';

const useStatusToggle = (customers, setCustomers, notify) => {
    const toggleStatus = async (id) => {
        const customer = customers.find(c => c.id === id);

        if (!customer) {
            console.warn(`Customer with id ${id} not found.`);
            return; // Exit if customer not found
        }

        if (customer.redeemed) {
            toast.error("Customer has already redeemed their points. Status cannot be changed.");
            return;
        }

        try {
            const newStatus = customer.status === "Approved" ? 'Pending' : 'Approved';
            const pointsChange = newStatus === 'Approved' ? 200 : -200; // Adjust points

            const { error } = await supabase
                .from('account_opening')
                .update({
                    status: newStatus,
                    points: customer.points + pointsChange,
                })
                .eq('id', id);

            if (error) {
                console.error("Error updating status: ", error.message);
                notify("Error updating status.", "error");
            } else {
                const updatedCustomers = customers.map(c =>
                    c.id === id ? { ...c, status: newStatus, points: c.points + pointsChange } : c
                );
                setCustomers(updatedCustomers);
                toast.success(`${pointsChange > 0 ? 'Assigned' : 'Reversed'} ${Math.abs(pointsChange)} points for ${customer.name}`);
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            notify("An unexpected error occurred while updating status.", "error");
        }
    };

    return { toggleStatus };
};

export default useStatusToggle;