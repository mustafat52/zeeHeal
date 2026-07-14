-- zeeheal — seed the 4 original starter plan templates
-- Session: dashboard/plan-template wiring
-- plan_templates has been empty in the real DB this whole time — the app
-- was only ever showing the static mock array in memory. Now that
-- planTemplates is hydrated from Supabase on every load (matching how
-- clients already works), these need to actually exist as real rows or
-- they'd silently disappear the moment that hydration runs.
-- Uses a subquery for nutritionist_id rather than a hardcoded UUID, since
-- this is a single-nutritionist app and this avoids needing to know her
-- exact UUID to run this migration.

insert into plan_templates (nutritionist_id, name, tag, description, condition, weekly_meals)
values
(
  (select id from nutritionists limit 1),
  'Gut health reset',
  '4 weeks',
  'Anti-inflammatory, dairy-free, fibre-rich meals to calm bloating and improve digestion.',
  'hormonal',
  '{
    "Mon": [{"label":"Breakfast","items":"Moong dal chilla, mint chutney"},{"label":"Lunch","items":"Khichdi, cucumber raita"},{"label":"Dinner","items":"Vegetable soup, grilled paneer"}],
    "Tue": [{"label":"Breakfast","items":"Vegetable poha, flax seeds"},{"label":"Lunch","items":"Brown rice, dal, sauteed greens"},{"label":"Dinner","items":"Grilled fish, steamed vegetables"}],
    "Wed": [{"label":"Breakfast","items":"Oats idli, sambhar"},{"label":"Lunch","items":"Quinoa pulao, raita"},{"label":"Dinner","items":"Tofu stir-fry, brown rice"}],
    "Thu": [{"label":"Breakfast","items":"Besan chilla, coriander chutney"},{"label":"Lunch","items":"Roti, lauki sabzi, dal"},{"label":"Dinner","items":"Clear soup, grilled chicken"}],
    "Fri": [{"label":"Breakfast","items":"Smoothie bowl, chia seeds"},{"label":"Lunch","items":"Millet khichdi, salad"},{"label":"Dinner","items":"Paneer bhurji, multigrain roti"}],
    "Sat": [{"label":"Breakfast","items":"Vegetable upma"},{"label":"Lunch","items":"Rajma, brown rice, salad"},{"label":"Dinner","items":"Vegetable soup, grilled tofu"}],
    "Sun": [{"label":"Breakfast","items":"Stuffed paratha (light), curd"},{"label":"Lunch","items":"Dal, sabzi, roti, salad"},{"label":"Dinner","items":"Khichdi, ghee"}]
  }'::jsonb
),
(
  (select id from nutritionists limit 1),
  'PCOS / hormone balance',
  '8 weeks',
  'Low-GI, seed-cycling based plan to support insulin sensitivity and hormone regulation.',
  'pcos',
  '{
    "Mon": [{"label":"Breakfast","items":"Flaxseed oats, berries"},{"label":"Lunch","items":"Quinoa, chickpea salad"},{"label":"Dinner","items":"Grilled fish, roasted vegetables"}],
    "Tue": [{"label":"Breakfast","items":"Pumpkin seed smoothie"},{"label":"Lunch","items":"Brown rice, rajma, greens"},{"label":"Dinner","items":"Chicken stew, sauteed spinach"}],
    "Wed": [{"label":"Breakfast","items":"Besan chilla, mint chutney"},{"label":"Lunch","items":"Millet khichdi, salad"},{"label":"Dinner","items":"Dal, brown rice, vegetables"}],
    "Thu": [{"label":"Breakfast","items":"Sesame seed porridge"},{"label":"Lunch","items":"Quinoa salad, grilled tofu"},{"label":"Dinner","items":"Grilled fish, steamed greens"}],
    "Fri": [{"label":"Breakfast","items":"Sunflower seed smoothie"},{"label":"Lunch","items":"Brown rice, chana, salad"},{"label":"Dinner","items":"Chicken soup, roasted vegetables"}],
    "Sat": [{"label":"Breakfast","items":"Flaxseed idli, sambhar"},{"label":"Lunch","items":"Rajma, quinoa, greens"},{"label":"Dinner","items":"Grilled paneer, sauteed vegetables"}],
    "Sun": [{"label":"Breakfast","items":"Pumpkin seed porridge"},{"label":"Lunch","items":"Dal, brown rice, salad"},{"label":"Dinner","items":"Fish curry, steamed vegetables"}]
  }'::jsonb
),
(
  (select id from nutritionists limit 1),
  'Sustainable weight loss',
  '6 weeks',
  'Calorie-aware, high-protein meals built around foods the client already eats.',
  'weight-loss',
  '{
    "Mon": [{"label":"Breakfast","items":"Vegetable oats, boiled egg"},{"label":"Lunch","items":"Multigrain roti, dal, salad"},{"label":"Dinner","items":"Grilled chicken, sauteed vegetables"}],
    "Tue": [{"label":"Breakfast","items":"Moong dal chilla, mint chutney"},{"label":"Lunch","items":"Brown rice, rajma, salad"},{"label":"Dinner","items":"Grilled fish, steamed vegetables"}],
    "Wed": [{"label":"Breakfast","items":"Besan chilla, coriander chutney"},{"label":"Lunch","items":"Quinoa salad, grilled tofu"},{"label":"Dinner","items":"Vegetable soup, grilled chicken"}],
    "Thu": [{"label":"Breakfast","items":"Sprouts salad, boiled egg"},{"label":"Lunch","items":"Multigrain roti, chana, salad"},{"label":"Dinner","items":"Tofu stir-fry, brown rice"}],
    "Fri": [{"label":"Breakfast","items":"Vegetable poha, flax seeds"},{"label":"Lunch","items":"Brown rice, dal, sauteed greens"},{"label":"Dinner","items":"Grilled fish, salad"}],
    "Sat": [{"label":"Breakfast","items":"Oats idli, sambhar"},{"label":"Lunch","items":"Rajma, brown rice, salad"},{"label":"Dinner","items":"Grilled chicken, multigrain roti"}],
    "Sun": [{"label":"Breakfast","items":"Egg bhurji, multigrain toast"},{"label":"Lunch","items":"Dal, sabzi, roti, salad"},{"label":"Dinner","items":"Clear soup, grilled fish"}]
  }'::jsonb
),
(
  (select id from nutritionists limit 1),
  'Skin and gut reset',
  '4 weeks',
  'Targets acne and dull skin through gut-skin axis support and reduced sugar load.',
  'skincare',
  '{
    "Mon": [{"label":"Breakfast","items":"Green smoothie, chia seeds, soaked almonds"},{"label":"Lunch","items":"Quinoa salad, cucumber, avocado, lemon dressing"},{"label":"Dinner","items":"Grilled salmon, steamed broccoli, brown rice"}],
    "Tue": [{"label":"Breakfast","items":"Berry and flaxseed smoothie"},{"label":"Lunch","items":"Chickpea salad, roasted pumpkin seeds"},{"label":"Dinner","items":"Grilled fish, sauteed spinach"}],
    "Wed": [{"label":"Breakfast","items":"Overnight oats, walnuts"},{"label":"Lunch","items":"Quinoa and avocado bowl, mixed greens"},{"label":"Dinner","items":"Turmeric lentil soup, brown rice"}],
    "Thu": [{"label":"Breakfast","items":"Green smoothie, pumpkin seeds"},{"label":"Lunch","items":"Grilled tofu salad, olive oil dressing"},{"label":"Dinner","items":"Baked fish, roasted vegetables"}],
    "Fri": [{"label":"Breakfast","items":"Chia pudding, mixed berries"},{"label":"Lunch","items":"Quinoa and avocado bowl"},{"label":"Dinner","items":"Grilled chicken, sauteed greens, sweet potato"}],
    "Sat": [{"label":"Breakfast","items":"Herbal tea, soaked almonds, fruit"},{"label":"Lunch","items":"Lentil and vegetable soup, multigrain toast"},{"label":"Dinner","items":"Grilled salmon, steamed broccoli"}],
    "Sun": [{"label":"Breakfast","items":"Green smoothie bowl"},{"label":"Lunch","items":"Chickpea and cucumber salad"},{"label":"Dinner","items":"Turmeric baked tofu, brown rice, greens"}]
  }'::jsonb
);