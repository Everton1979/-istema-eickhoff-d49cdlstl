DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Retrieve the seed user's ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'farmaciaeickhoff@terra.com.br' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Insert test data explicitly matching the indicators validation criteria:
    -- Mar: Ticket 131.28 | Markup 6.75 -> Sales: 147690.00, Orders: 1125, Costs: 21880.00
    -- Apr: Ticket 130.98 | Markup 6.62 -> Sales: 139886.64, Orders: 1068, Costs: 21130.91
    -- May: Ticket 126.14 | Markup 7.11 -> Sales: 135474.36, Orders: 1074, Costs: 19054.06
    INSERT INTO public.monthly_metrics (
      user_id, project_id, month, year, orders_count, total_system_sales, raw_material_costs
    ) VALUES 
      (v_user_id, 'farmacia', 3, 2024, 1125, 147690.00, 21880.00),
      (v_user_id, 'farmacia', 4, 2024, 1068, 139886.64, 21130.91),
      (v_user_id, 'farmacia', 5, 2024, 1074, 135474.36, 19054.06)
    ON CONFLICT (user_id, month, year, project_id) DO NOTHING;
  END IF;
END $$;
