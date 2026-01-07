import "dotenv/config";
import { supabaseAdmin } from "./lib/supabase";

async function checkOrder() {
    console.log("🔍 Inspecting most recent order...");
    const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) {
        console.error("❌ Error fetching order:", error);
        return;
    }

    if (!orders || orders.length === 0) {
        console.log("❌ No orders found in database.");
        return;
    }

    const order = orders[0];
    console.log(`✅ Found Order ID: ${order.order_id}`);
    console.log(`   Customer: ${order.customer_email}`);
    console.log(`   Items:`, JSON.stringify(order.cart_items, null, 2));
}

checkOrder();
