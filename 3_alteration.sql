
USE projet_site;

ALTER TABLE produit
ADD COLUMN description TEXT;

SET SQL_SAFE_UPDATES = 0;
UPDATE produit
SET description = CASE

    WHEN nom = 'Shawarma Beef Medium'
    THEN 'Shawarma is a popular Middle Eastern dish, particularly associated with Levantine cuisine. Meat is seasoned with spices and slowly roasted on a vertical spit. It is commonly served in flatbread with vegetables, pickles and garlic sauce.'

    WHEN nom = 'Thai Basil Minced Pork Rice'
    THEN 'This dish is inspired by Thai pad kra pao, a popular everyday meal. Minced pork is stir-fried with garlic, chili and Thai basil, then served over rice. It combines spicy, savory and aromatic flavors and is often topped with a fried egg.'

    WHEN nom = '6-Inch Mushroom Chicken and Garlic Butter Meal with corn/toasties'
    THEN 'This sandwich reflects the international popularity of American-style submarine sandwiches. Chicken, mushrooms and garlic butter create a savory combination, often accompanied by bread or corn. It is a modern fast-food interpretation rather than a traditional dish from one specific culture.'

    WHEN nom = 'Shredded Chicken Noodle'
    THEN 'Shredded chicken noodles are common throughout East and Southeast Asia. Thinly shredded chicken is served with noodles and may be accompanied by broth, vegetables or a seasoned sauce. Recipes vary considerably between Chinese regional traditions and modern Malaysian noodle shops.'

    WHEN nom = 'Tender Wrap'
    THEN 'Chicken wraps are part of the modern international fast-food tradition. Crispy or seasoned chicken is wrapped in a soft tortilla or flatbread with sauces and other fillings. Their convenient format combines influences from sandwiches, flatbreads and contemporary street food.'

    WHEN nom = 'Chicken Hor Fun Soup'
    THEN 'Hor fun is a Cantonese-style rice noodle made from wide, flat strips of rice flour. It is popular in Malaysia and Singapore, where Chinese culinary traditions have blended with local food culture. This soup version combines noodles, chicken and a comforting broth.'

    WHEN nom = 'Beef Croissandwich w Egg Meal'
    THEN 'This croissant sandwich combines French-style laminated pastry with the modern Western breakfast sandwich. Beef and egg provide a savory, filling combination, while the croissant contributes a buttery, flaky texture. It illustrates how international fast-food chains adapt familiar ingredients into hybrid dishes.'

    WHEN nom = 'Arabic Set Shawarma Chicken'
    THEN 'Chicken shawarma is a well-known Middle Eastern street food. The meat is marinated with spices, stacked on a vertical spit and slowly roasted. It is commonly served with flatbread, vegetables, garlic sauce and other regional accompaniments.'

    WHEN nom = 'Chicken Special Set'
    THEN 'The name suggests a chicken-based meal served as a set, a popular format throughout Asian food courts. Such meals often combine a main dish with rice, vegetables or sauces. The exact ingredients and cultural influences depend on the restaurant recipe.'

    WHEN nom = 'Purple Sweet Potato Finger (3Pcs)'
    THEN 'Sweet potatoes have been cultivated and eaten across Asia for centuries and are especially popular in many East and Southeast Asian snacks. Purple varieties contain natural pigments called anthocyanins, which give them their distinctive color. These finger-shaped portions offer a convenient way to enjoy the vegetable as a snack.'

    WHEN nom = '1/4 Chicken with 2SD + Nata'
    THEN 'Quarter chicken meals are popular in Portuguese-inspired and international grilled-chicken restaurants. The chicken is typically marinated and roasted or grilled, then served with two side dishes. The format reflects the popularity of casual dining built around grilled poultry and customizable accompaniments.'

    WHEN nom = 'Kim Bap'
    THEN 'Gimbap is a Korean dish made with rice and various fillings rolled in dried seaweed. Common ingredients include vegetables, egg and meat, depending on the recipe. It is often prepared for picnics, packed lunches and convenient meals.'

    WHEN nom = 'Chicken Sandwich'
    THEN 'Chicken sandwiches are enjoyed worldwide and have many regional variations. This version comes from a restaurant specializing in Middle Eastern food, a culinary tradition known for grilled meats, herbs and flavorful sauces. The bread and seasoning distinguish it from other international sandwich styles.'

    WHEN nom = 'Marmite''s Pork + Dry Noodles'
    THEN 'Dry noodle dishes are widespread in Chinese cuisine, particularly in regions where noodles are served with concentrated sauces rather than broth. This version combines pork with a Marmite-style savory seasoning. Its flavor profile reflects the way modern Asian restaurants adapt familiar noodle dishes with distinctive sauces.'

    WHEN nom = 'Shawarma Chicken Fries (L) + 1 Barbican'
    THEN 'Shawarma combines Middle Eastern roasted meat traditions with the convenience of street food. Serving shawarma-seasoned chicken with fries is a modern fusion format rather than a traditional regional recipe. Barbican is a non-alcoholic malt beverage popular in several Middle Eastern markets.'

    WHEN nom = 'Salmon Truffle Mash'
    THEN 'Salmon is an important ingredient in many European and contemporary international cuisines. Truffles are prized fungi associated especially with French and Italian fine dining, while mashed potatoes are a familiar European accompaniment. Together, these ingredients create a modern restaurant-style combination of fish, earthy aromas and creamy texture.'

    WHEN nom = 'THE CLASSIC'
    THEN 'The name suggests a classic-style café dish, but its exact ingredients cannot be established from the name alone. Classic café meals often draw on European and Western breakfast or brunch traditions. The specific ingredients depend on the restaurant menu.'

    WHEN nom = 'Hummus Beef Shawarma'
    THEN 'This dish combines two popular elements of Levantine cuisine: hummus and beef shawarma. Hummus is a creamy preparation of chickpeas, tahini, lemon and garlic, while shawarma uses seasoned meat roasted on a vertical spit. Together they represent the region’s tradition of sharing flavorful dips, meats and flatbreads.'

    WHEN nom = 'Kunafa Chocolate'
    THEN 'Kunafa, also spelled knafeh, is a traditional dessert associated with the Levant and other parts of the Middle East. It commonly uses fine pastry strands or semolina dough with a sweet filling and syrup. Chocolate versions are modern variations that combine traditional dessert techniques with contemporary confectionery.'

    WHEN nom = 'Chicken Kebab Sandwich'
    THEN 'Kebabs have a long history across the Middle East and neighboring regions, with many variations in meat preparation and seasoning. A chicken kebab sandwich adapts these grilled or roasted meat traditions to a convenient bread-based meal. It is often accompanied by vegetables, herbs and sauces.'

    WHEN nom = 'Sweet Pork Ribs Rice'
    THEN 'Pork ribs served with rice reflect the importance of rice-based meals in many Chinese and Southeast Asian food traditions. Sweet sauces may use sugar, soy sauce and other seasonings to balance savory flavors. The exact regional origin and recipe vary between restaurants.'

    WHEN nom = 'Veggie Burger with 2 sides'
    THEN 'Vegetarian burgers developed as a plant-based alternative to the traditional meat burger. They are part of a modern international food movement focused on offering more meat-free choices. Serving the burger with two sides follows the customizable meal format popular in Western casual dining.'

    WHEN nom = 'Chocolat Xiao Long Bao (10pc)'
    THEN 'Xiao long bao are traditionally Chinese soup dumplings strongly associated with Jiangnan cuisine, particularly Shanghai. Classic versions contain a savory filling and broth enclosed in delicate dough. Chocolate versions are modern dessert adaptations that replace traditional savory flavors with a sweet filling.'

    WHEN nom = 'Chicken Xiao Long Bao (10pc)'
    THEN 'Xiao long bao are delicate Chinese dumplings traditionally filled with seasoned meat and hot broth. They are closely associated with Shanghai-style cuisine and are carefully folded to contain their filling. A chicken version adapts this well-known dumpling style with a different protein.'

    WHEN nom = 'Matcha Xiao Long Bao (6pc)'
    THEN 'Matcha is finely ground green tea powder with a long history in Japanese tea culture. Xiao long bao, by contrast, are Chinese soup dumplings associated with Shanghai-style cuisine. Matcha-filled versions combine these distinct culinary traditions in a contemporary dessert interpretation.'

    WHEN nom = 'BBQ Chicken Bun (3pc)'
    THEN 'Barbecue-filled buns are part of the broader Chinese tradition of filled breads and steamed buns. Cantonese char siu bao traditionally contain sweet and savory barbecued pork. A chicken version applies a similar flavor concept to poultry, although the precise preparation depends on the recipe.'

    WHEN nom = 'Tamago Yaki with Mentaiko (1pc)'
    THEN 'Tamagoyaki is a Japanese rolled omelet made by cooking thin layers of seasoned egg. Mentaiko consists of marinated pollock roe and is especially associated with Japanese cuisine, with influences from Korean jeotgal traditions. Combining the two creates a savory dish that balances soft egg with the distinctive taste of seasoned roe.'

    WHEN nom = 'Pasta Basil Pistachio Pesto'
    THEN 'Pesto is traditionally associated with Liguria in northwestern Italy, particularly Genoa. Classic pesto combines basil, garlic, olive oil, cheese and pine nuts. This variation uses pistachios, introducing a different nutty flavor while retaining the Italian tradition of herb-based pasta sauces.'

    WHEN nom = 'Pork Bun (1pc)'
    THEN 'Pork buns are found in several Chinese culinary traditions, including Cantonese dim sum. They may be steamed or baked, with fillings ranging from juicy minced pork to sweet barbecued pork. These buns illustrate the importance of filled dough dishes in Chinese snack and tea culture.'

    WHEN nom = 'Chives and Pork Dumplings (10pc)'
    THEN 'Pork and chive dumplings are popular in northern Chinese home cooking. Their filling combines seasoned pork with aromatic Chinese chives, wrapped in a wheat-based dough. Dumplings are traditionally associated with family gatherings and are especially important during Lunar New Year celebrations.'

    WHEN nom = 'TENDERLOIN KATDU DON'
    THEN 'The name appears to refer to a Japanese-style katsu don, a rice bowl traditionally topped with breaded and fried cutlet. Katsu developed through Japanese adaptations of Western-style breaded meat dishes. The tenderloin version uses a particular cut of meat, although the restaurant’s exact preparation may differ.'

    WHEN nom = 'TENDERLON KATSU SANDWICH'
    THEN 'Katsu sandwiches are a popular Japanese adaptation of Western sandwich culture. They typically contain a breaded, deep-fried cutlet between slices of soft bread, often with shredded cabbage and a tangy sauce. The combination of crisp coating and tender filling is characteristic of yoshoku, Japanese cuisine influenced by Western cooking.'

    WHEN nom = 'Spaghetti chicken bolognese'
    THEN 'Bolognese sauce originates from Bologna in the Emilia-Romagna region of Italy. Traditional ragù is slowly cooked using meat, vegetables and other ingredients, and is classically paired with tagliatelle. This version uses chicken instead of the more usual beef or mixed meat, adapting the Italian-inspired sauce to a different protein.'

    WHEN nom = 'Margherita'
    THEN 'Pizza Margherita is associated with Naples, Italy, the birthplace of modern pizza. Its classic toppings are tomato, mozzarella and basil, often said to represent the colors of the Italian flag. Its simplicity makes it one of the best-known Italian dishes.'

    WHEN nom = 'Wasabi'
    THEN 'Wasabi is a pungent Japanese condiment traditionally made from the grated rhizome of the Wasabia japonica plant. It is commonly served with sushi and sashimi, where its sharp flavor complements fish. Many commercial versions use horseradish and mustard because genuine wasabi is relatively expensive and perishable.'

    WHEN nom = 'Shredded Chicken Noodles'
    THEN 'Shredded chicken noodles are common in Taiwanese and broader Chinese food traditions. Tender chicken is cut into thin strips and combined with noodles, often with vegetables, broth or a seasoned sauce. Taiwanese noodle dishes reflect a mixture of regional Chinese influences and local culinary adaptations.'

    WHEN nom = 'Tempura Chicken Nugget'
    THEN 'Tempura is a Japanese cooking technique in which ingredients are coated in a light batter and fried. The technique has historical links to Portuguese culinary influences introduced to Japan centuries ago. Chicken nuggets prepared in a tempura-style coating adapt this technique to a modern snack.'

    WHEN nom = 'Taiwanese Braised Pork Rice'
    THEN 'Lu rou fan is a classic Taiwanese comfort food made with minced or finely chopped pork braised in soy sauce and aromatic seasonings. It is served over steamed rice and is popular in home cooking and night markets. Recipes vary between regions and families.'

    WHEN nom = 'Brownie'
    THEN 'The brownie is a chocolate dessert that developed in the United States in the late nineteenth century. It is known for its dense texture, which can range from fudgy to cake-like. Today it is popular internationally and is commonly served as a snack or café dessert.'

    WHEN nom = 'Garlic Sauce'
    THEN 'Garlic sauces appear in many culinary traditions, from Mediterranean aioli to Middle Eastern toum. Lebanese-style toum is traditionally made by emulsifying garlic, oil, lemon juice and salt into a fluffy sauce. The exact ingredients of this particular sauce depend on the restaurant recipe.'

    WHEN nom = 'Potato Seedlings with Belacan'
    THEN 'Belacan is a fermented shrimp paste widely used in Malaysian and Indonesian cooking. It contributes a strong savory aroma and deep umami flavor to vegetables, sambal and stir-fries. This dish combines a local seasoning tradition with a potato-based ingredient, although the exact vegetable preparation depends on the restaurant.'

    WHEN nom = 'Coconut Chicken Soup + Free White Rice'
    THEN 'Coconut chicken soup draws on the use of coconut milk or coconut-based broth found in many Southeast Asian cuisines. Coconut adds richness while chicken and herbs provide savory flavors. This style of soup reflects the region’s culinary use of aromatic ingredients and nourishing broth-based meals.'

    WHEN nom = 'White Rice'
    THEN 'White rice is a staple food across much of Asia, including Malaysia, China, Japan and Southeast Asia. The grains are milled to remove the bran and germ, producing a softer texture and milder flavor. It is served alongside curries, grilled meats, soups and countless everyday dishes.'

    WHEN nom = 'Aesorted Pork Wontons (12pc)'
    THEN 'Wontons are traditional Chinese dumplings made with thin wrappers around a savory filling. Pork is a common ingredient, and wontons can be boiled, served in soup or prepared with sauces. Their many regional variations reflect the diversity of Chinese dumpling culture.'

    WHEN nom = 'Salted Egg Yolk & Pork Shumai'
    THEN 'Shumai, also spelled siu mai, are open-topped dumplings commonly served during Cantonese dim sum. They often contain pork, shrimp or both, wrapped in a thin dough. Salted egg yolk adds a rich, savory flavor and represents a modern variation on the traditional dumpling.'

    WHEN nom = 'Matcha Latte'
    THEN 'Matcha is finely ground green tea powder deeply associated with Japanese tea culture. A matcha latte blends the tea with milk to create a creamy drink that balances earthy and slightly bitter notes. Its worldwide popularity reflects the growing international appreciation of Japanese tea ingredients.'

    WHEN nom = 'Har Gaw'
    THEN 'Har gow are traditional Cantonese dumplings commonly served during yum cha, the Chinese tea-and-dim-sum tradition. They are usually filled with shrimp and wrapped in a delicate, translucent dough made with starches. Their pleated appearance is a hallmark of Cantonese dim sum.'

    WHEN nom = 'Golden Bun'
    THEN 'Golden buns are commonly found in Chinese restaurant menus as sweet or savory steamed and fried breads. Some versions are fried until golden and served with condensed milk, while others contain a filling. The exact ingredients and preparation of this particular bun depend on the restaurant.'

    WHEN nom = 'Bacon Roll Dumpling'
    THEN 'Dumplings are an important part of many Chinese culinary traditions, with numerous regional shapes and fillings. This version combines the dumpling concept with bacon, an ingredient more associated with Western cooking. It illustrates how contemporary restaurants combine culinary influences to create fusion snacks.'

    WHEN nom = 'Spicy Peanut Braised Chicken Feet'
    THEN 'Chicken feet are enjoyed in several Chinese culinary traditions, especially Cantonese dim sum and braised dishes. They are often simmered until tender in sauces made with spices, soy sauce or fermented ingredients. Peanuts and chili add texture and heat to this variation.'

    WHEN nom = 'Spicy Chicken Mandy'
    THEN 'Mandi is a traditional Yemeni rice dish that has become popular across the Arabian Peninsula and the wider Middle East. It typically combines spiced rice with chicken or lamb cooked using traditional roasting techniques. A spicy chicken version adds extra heat to this aromatic rice-based meal.'

    WHEN nom = 'Lamb Samousa'
    THEN 'Samosas are popular across South Asia, the Middle East and parts of Africa. They consist of pastry filled with ingredients such as spiced meat or vegetables, then fried or baked. Lamb versions combine a crisp exterior with a savory, aromatic filling.'

    WHEN nom = 'Roast Chicken + Roast Pork + Char Siu Rice'
    THEN 'This rice meal combines roasted meats from Chinese culinary traditions, particularly Cantonese roast meat culture. Char siu is pork marinated in a sweet and savory sauce before being roasted, while roast chicken and crispy roast pork offer different textures. Such rice plates are popular in Malaysian Chinese restaurants and hawker centres.'

    WHEN nom = 'Tawa'
    THEN 'Tawa refers to a flat cooking griddle widely used in South Asian and Middle Eastern cooking. It is used to prepare flatbreads, pancakes and various savory foods over direct heat. Because the menu name alone does not identify the exact dish, its specific ingredients and regional origin remain uncertain.'

    WHEN nom = 'Tabbouleh'
    THEN 'Tabbouleh is a Levantine salad particularly associated with Lebanese cuisine. It traditionally features parsley, tomatoes, mint, bulgur, lemon juice and olive oil. Its fresh herbs and citrus dressing make it a distinctive dish in the region’s food culture.'

    WHEN nom = 'Set Sotong Gepuk'
    THEN 'Sotong means squid in Malay and Indonesian, while gepuk generally refers to a preparation involving pounding or tenderizing ingredients in Indonesian food terminology. The name may describe a locally adapted squid dish served as a set meal. Its precise cultural origin and preparation would need confirmation from the restaurant menu.'

    WHEN nom = '( Nasi Minyak ) Set Ayam Bawang + Daging Hitam'
    THEN 'Nasi minyak is a fragrant rice dish associated with Malay festive meals and South Asian culinary influences. Ayam bawang refers to chicken prepared with onions, while daging hitam generally describes dark, richly seasoned meat. This set brings together aromatic rice and meat dishes popular in Malaysian food culture.'

    WHEN nom = 'Signature Braised Pork QQ Noodle'
    THEN 'Braised pork noodles reflect the influence of Chinese noodle traditions across Taiwan and Southeast Asia. The term QQ is commonly used in Taiwanese food culture to describe a pleasantly chewy texture. Slow-braised pork adds savory depth, while the noodles provide the dish’s characteristic bite.'

    WHEN nom = 'Pan Mee BYOB'
    THEN 'Pan mee is a Malaysian Chinese noodle dish with roots in Hakka cooking. Its noodles may be handmade and served in soup or with a dry sauce, often accompanied by anchovies, leafy vegetables and chili. It is a familiar comfort food in Malaysian hawker culture.'

    WHEN nom = '[Bundle] 2× Japanese Curry Fish Katsu Don'
    THEN 'Katsu don is a Japanese rice bowl traditionally topped with breaded and fried cutlet. Japanese curry, influenced by British adaptations of Indian curry during the nineteenth century, is generally thicker and milder than many South Asian curries. This bundle combines the Japanese curry tradition with fish katsu and rice.'

    WHEN nom = 'Japonese Katsu Curry Chicken Chop Rice Set'
    THEN 'Japanese katsu curry combines a breaded, fried cutlet with Japanese-style curry and rice. The curry developed through historical influences from British and Indian cooking and became a familiar Japanese comfort food. This version uses chicken instead of the pork commonly found in tonkatsu.'

    ELSE description
END;
