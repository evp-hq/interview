/**
 * A fake, deliberately unreliable client-side API.
 *
 * Every call waits 300–1000 ms and fails on roughly 20% of calls,
 * just like a real network request on a bad day.
 */

export type Customer = {
    id: number;
    name: string;
    city: string;
    email: string;
};

const customers: Customer[] = [
    { id: 1, name: 'Aarav Sharma', city: 'Delhi' },
    { id: 2, name: 'Priya Iyer', city: 'Chennai' },
    { id: 3, name: 'Rohan Mehta', city: 'Mumbai' },
    { id: 4, name: 'Ananya Reddy', city: 'Hyderabad' },
    { id: 5, name: 'Vikram Nair', city: 'Kochi' },
    { id: 6, name: 'Sneha Kulkarni', city: 'Pune' },
    { id: 7, name: 'Arjun Gupta', city: 'Lucknow' },
    { id: 8, name: 'Kavya Menon', city: 'Thiruvananthapuram' },
    { id: 9, name: 'Rahul Verma', city: 'Jaipur' },
    { id: 10, name: 'Diya Banerjee', city: 'Kolkata' },
    { id: 11, name: 'Ishaan Joshi', city: 'Ahmedabad' },
    { id: 12, name: 'Meera Pillai', city: 'Bengaluru' },
    { id: 13, name: 'Kabir Singh', city: 'Chandigarh' },
    { id: 14, name: 'Aditi Desai', city: 'Surat' },
    { id: 15, name: 'Siddharth Rao', city: 'Mangaluru' },
    { id: 16, name: 'Neha Chatterjee', city: 'Kolkata' },
    { id: 17, name: 'Aditya Patil', city: 'Nagpur' },
    { id: 18, name: 'Pooja Agarwal', city: 'Indore' },
    { id: 19, name: 'Karthik Subramanian', city: 'Coimbatore' },
    { id: 20, name: 'Riya Malhotra', city: 'Delhi' },
    { id: 21, name: 'Manish Tiwari', city: 'Bhopal' },
    { id: 22, name: 'Lakshmi Krishnan', city: 'Chennai' },
    { id: 23, name: 'Varun Kapoor', city: 'Mumbai' },
    { id: 24, name: 'Shreya Ghosh', city: 'Guwahati' },
    { id: 25, name: 'Nikhil Hegde', city: 'Mysuru' },
    { id: 26, name: 'Tanvi Bhatt', city: 'Vadodara' },
    { id: 27, name: 'Harsh Saxena', city: 'Kanpur' },
    { id: 28, name: 'Divya Naidu', city: 'Visakhapatnam' },
    { id: 29, name: 'Rajesh Kumar', city: 'Patna' },
    { id: 30, name: 'Anjali Mishra', city: 'Varanasi' },
].map((customer) => ({
    ...customer,
    email: `${customer.name.toLowerCase().replace(' ', '.')}@example.com`,
}));

function wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Search customers by name or city (case-insensitive).
 */
export async function searchCustomers(q: string): Promise<Customer[]> {
    await wait(randomBetween(300, 1000));

    if (Math.random() < 0.2) {
        throw new Error('Network error: failed to fetch customers.');
    }

    const query = q.trim().toLowerCase();

    if (query === '') {
        return [...customers];
    }

    return customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(query) ||
            customer.city.toLowerCase().includes(query),
    );
}
